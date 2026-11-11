const { test, expect, request } = require('@playwright/test');
test('visual Testing ',async({page})=>{
    await page.goto("https://www.google.com/");
    expect(await page.screenshot()).toMatchSnapshot('landing.png');


})