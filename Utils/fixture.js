const base = require("@playwright/test");
const { request } = require("@playwright/test");
const { APIUtils } = require("./APIUtils");

const loginPayLoad =
{
    userEmail: 'kavyaprajeesh123@gmail.com',
    userPassword: 'kavya@123'
};

const orderPayLoad = {
    orders: [
        {
            country: "India",
            productOrderedId: "6960eac0c941646b7a8b3e68",
        },
    ],
};
exports.customtest = base.test.extend({
    authenticatedPage: async ({ browser }, use) => {


        const context = await browser.newContext();

        const page = await context.newPage();

        await page.goto("https://rahulshettyacademy.com/client");

        await page.locator("#userEmail").fill(
            loginPayLoad.userEmail);

        await page.locator("#userPassword").fill(
            loginPayLoad.userPassword
        );

        await page.locator("[value='Login']").click();

        await page.locator(".card-body b").first().waitFor();

        await use(page);

        await context.close();
    },

    createOrder: async ({ }, use) => {


        const apiContext = await request.newContext();

        const apiUtils = new APIUtils(apiContext, loginPayLoad);

        const response = await apiUtils.createOrder(orderPayLoad);

        await use(response);

        await apiContext.dispose();
    },

    testDataForOrder: async ({ }, use) => {
        const testData = {
            productName: "ADIDAS ORIGINAL",
        };

        await use(testData);
    },
});
