const { test, expect, request } = require('@playwright/test');
const { APIUtils } = require('./Utils/APIUtils');
const loginPayLoad = { userEmail: "anshika@gmail.com", userPassword: "Iamking@000" };
const orderPayLoad = { orders: [{ country: "Cuba", productOrderedId: "6960eac0c941646b7a8b3e68" }] };
const fakePayLoadOrders = { data: [], message: "No Orders" };
 
let response;
test.beforeAll(async () => {
  const apiContext = await request.newContext();
  const apiUtils = new APIUtils(apiContext, loginPayLoad);
  response = await apiUtils.createOrder(orderPayLoad);
  await apiContext.dispose();
});
 
 
//create order is success
test('@SP Place the order', async ({ page }) => {
  await page.addInitScript(value => {
    window.localStorage.setItem('token', value);
  }, response.token);
  await page.goto("https://rahulshettyacademy.com/client");
 
  await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*",
    async route => {
      const response = await page.request.fetch(route.request());
      const body = JSON.stringify(fakePayLoadOrders);
      await route.fulfill({ response, body });
      //intercepting response -APi response-> { playwright fakeresponse}->browser->render data on front end
    });
 
  const responsePromise = page.waitForResponse(
    "https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*"
  );
  await page.locator("button[routerlink*='myorders']").click();
  await responsePromise;

  await expect(page.locator(".mt-4")).toContainText("You have No Orders to show");
});