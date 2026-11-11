const { test, expect } = require('@playwright/test');

const futureDateValue = () => {
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return future.toISOString().slice(0, 16);
};

test('Event Creation', async ({ page }) => {
  const baseUrl = 'https://eventhub.rahulshettyacademy.com';

  await page.goto(baseUrl);

  await page.getByPlaceholder('you@email.com').fill('kavyaprajeesh123@gmail.com');
  await page.getByLabel('Password').fill('Prajeesh@123');
  await page.locator('#login-btn').click();

  await page.waitForLoadState('networkidle');
  await expect(page.locator('#nav-home')).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('link', { name: 'Browse Events →' })).toBeVisible();

  await page.getByTestId('nav-events').click();

  const eventTitle = `Kochin Carnival ${Date.now()}`;

  await page.getByRole('button', { name: 'Add New Event' }).click();
  await page.locator('#event-title-input').fill(eventTitle);
  await page.getByLabel('Category*').selectOption('Festival');
  await page.getByLabel('City*').fill('Kochi');
  await page.getByLabel('Venue*').fill('DarbarHall');
  await page.getByLabel('Event Date & Time*').fill(futureDateValue());
  await page.getByLabel('Price ($)*').fill('100');
  await page.getByLabel('Total Seats*').fill('197');
  await page.locator('#add-event-btn').click();

  await expect(page.getByText(/Event created!/)).toBeVisible({ timeout: 10000 });

  await page.getByTestId('nav-events').click();
  await page.waitForLoadState('networkidle');

  const eventCard = page.getByTestId('event-card').filter({ hasText: eventTitle });
  await expect(eventCard.first()).toBeVisible({ timeout: 15000 });

  const seatText = await eventCard.locator('text=Seats').first().innerText();
  const seatsBeforeBooking = Number((seatText.match(/\d+/) || [])[0] ?? 0);

  await eventCard.locator('[data-testid="book-now-btn"]').click();

  await expect(page.locator('#ticket-count')).toHaveText('1');
  await page.getByLabel('Full Name*').fill('John Doe');
  await page.locator('#customer-email').fill('kavya123@gmail.com');
  await page.getByPlaceholder('+91 98765 43210').fill('8125532156');
  await page.locator('.confirm-booking-btn').click();

  const bookingRefElement = page.locator('.booking-ref').first();
  await expect(bookingRefElement).toBeVisible({ timeout: 15000 });
  const bookingRef = (await bookingRefElement.innerText()).trim();

  await page.getByRole('button', { name: 'View My Bookings' }).click();
  await expect(page).toHaveURL(`${baseUrl}/bookings`);

  const bookingCards = page.locator('#booking-card');
  await expect(bookingCards.first()).toBeVisible({ timeout: 15000 });
  const matchedBookingCard = bookingCards.filter({
    has: page.locator('.booking-ref', { hasText: bookingRef }),
  });
  await expect(matchedBookingCard).toBeVisible({ timeout: 15000 });
  await expect(matchedBookingCard).toContainText(eventTitle);

  await page.locator('#nav-events').click();
  await expect(page.getByTestId('event-card').first()).toBeVisible({ timeout: 15000 });

  const eventCardAfterBooking = page.getByTestId('event-card').filter({ hasText: eventTitle });
  await expect(eventCardAfterBooking).toBeVisible({ timeout: 15000 });
});
