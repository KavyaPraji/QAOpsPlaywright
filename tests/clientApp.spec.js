const { test, expect, request } = require('@playwright/test');
const {APIUtils}=require('./Utils/APIUtils')
const loginPayload = { userEmail: 'kavyaprajeesh123@gmail.com', userPassword: 'kavya@123' };
const orderPayLoad={orders: [{country: "Cuba", productOrderedId: "6960eac0c941646b7a8b3e68"}]};
let response;
test.beforeAll(async () => {
    const apiContext = await request.newContext();
    const apiUtils=new APIUtils(apiContext,loginPayload);
    response=await apiUtils.createOrder(orderPayLoad);
    
});

test('@Webst Client App login', async ({ page }) => {
   await page.addInitScript(value=>{
      window.localStorage.setItem('token',value)
   },response.token);
   
   await page.goto("https://rahulshettyacademy.com/client");
    await page.locator("button[routerlink*='myorders']").click();
   
   await page.locator("tbody").waitFor();
   // await page.screenshot({path:'screenshot.png'});
   const rows = await page.locator("tbody tr");
 
 
   for (let i = 0; i < await rows.count(); ++i) {
      const rowOrderId = await rows.nth(i).locator("th").textContent();
      if (response.orderId.includes(rowOrderId)) {
         await rows.nth(i).locator("button").first().click();
         break;
      }
   }
   const orderIdDetails = await page.locator(".col-text").textContent();
   await page.locator(".col-text").screenshot({path:'partialScreenshot.png'})
   
   expect(response.orderId.includes(orderIdDetails)).toBeTruthy();


 
});
 
 