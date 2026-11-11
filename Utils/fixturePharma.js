const { test, expect, request } = require("@playwright/test");

const loginPayload = {
    Username: "admin",
    Password: "pharmacytest@123",
};

exports.customtest = test.extend({
    pharmaLogin: async ({}, use) => {
        const apiContext = await request.newContext();

        try {
            const loginResponse = await apiContext.post(
                "https://test.pharmacyplus.app/server/api/login/UserVeryfy",
                { data: loginPayload },
            );
            expect(loginResponse.ok(), "Pharmacy API login should succeed").toBeTruthy();

            const loginUser = await loginResponse.json();
            expect(loginUser.Token, "Pharmacy API login should return a token").toBeTruthy();

            await use({ loginUser });
        } finally {
            await apiContext.dispose();
        }
    },

    authenticatedPage: async ({ browser, pharmaLogin }, use) => {
        const context = await browser.newContext();

        try {
            const page = await context.newPage();
            await page.addInitScript((user) => {
                localStorage.setItem("currentUser", JSON.stringify(user));
                localStorage.setItem("userGuid", user.UserReferenceId);
            }, pharmaLogin.loginUser);

            await page.goto("https://test.pharmacyplus.app/#/mainmenugrid");
            await page.waitForURL("**/mainmenugrid", { timeout: 15000 });

            const branch = page.getByRole("button", { name: "Netsoft 3" });
            await expect(branch).toBeVisible({ timeout: 15000 });
            await branch.click();

            await use(page);
        } finally {
            await context.close();
        }
    },

    createGRN: async ({ authenticatedPage }, use) => {
        await use(async () => {
            const page = authenticatedPage;
            const supplier = "GHUZLAN MEDICAL";
            const invoiceNumber = String(Math.floor(100000000 + Math.random() * 900000000));

            await page.locator("a").filter({ hasText: "shopping_cartPurchasing &" }).click();
            await page.locator("a").filter({ hasText: "hdr_weakGoods Received Note" }).click();

            const newGRNButton = page.getByRole("button", { name: "New" });
            await expect(newGRNButton).toBeVisible({ timeout: 30000 });
            await expect(newGRNButton).toBeEnabled({ timeout: 30000 });
            await newGRNButton.click();

            const searchFields = page.getByRole("textbox", { name: "Search" });
            const supplierSearch = searchFields.nth(1);
            const itemSearch = searchFields.nth(2);
            await supplierSearch.pressSequentially(supplier.split(" ")[0], { delay: 30 });

            const supplierOption = page.getByText(supplier, { exact: true });
            await expect(supplierOption).toBeVisible({ timeout: 10000 });
            await supplierOption.click();

            const grnDate = new Date();
            grnDate.setDate(1);
            grnDate.setMonth(grnDate.getMonth() - 1);
            grnDate.setDate(22);
            const grnDateLabel = `22 ${grnDate.toLocaleString("en-US", { month: "long" })} ${grnDate.getFullYear()}`;
            const calendarButtons = page.getByRole("button", { name: "Open calendar" });
            const selectPreviousMonthDate = async (calendarIndex) => {
                await calendarButtons.nth(calendarIndex).click();
                await page.getByRole("button", { name: "Previous month" }).last().click();
                await page.getByRole("button", { name: grnDateLabel, exact: true }).last().click();
            };
            await selectPreviousMonthDate(0);
            await selectPreviousMonthDate(2);

            await itemSearch.pressSequentially("dove deo", { delay: 30 });
            const productOption = page.getByText("DOVE DEO SPRAY BEAUTY FINISH 169 ML EACH").first();
            await expect(productOption).toBeVisible({ timeout: 10000 });
            await productOption.click();

            await page.locator(".qty > .form-control").fill("5");
            await page.locator(".bonus > .form-control").fill("5");
            await page.getByRole("spinbutton", { name: "MM" }).fill("2");
            await page.getByRole("spinbutton", { name: "YY" }).fill("28");
            await page.getByRole("textbox", { name: "--" }).nth(1).fill(invoiceNumber);
            await page.getByRole("button", { name: "Save" }).click();

            await expect(page.getByText("Record saved successfully")).toBeVisible();
            await expect(page).toHaveURL(
                "https://test.pharmacyplus.app/#/pharmacy/phapurchasemasterlist",
            );

            const grnNumber = page.locator("td.mat-column-NumberDisplay").first();
            await expect(grnNumber).toBeVisible();
            const grnNumberValue = (await grnNumber.textContent())?.trim();
            expect(grnNumberValue, "Created GRN should have a number").toBeTruthy();

            return grnNumberValue;
        });
    },

    createPurchaseReturn: async ({ authenticatedPage }, use) => {
        await use(async (grnNumber) => {
            const page = authenticatedPage;
            const supplier = "GHUZLAN MEDICAL";

            await page.locator("a").filter({ hasText: "Purchase Return" }).click();

            const newPRButton = page.getByRole("button", { name: "New" });
            await expect(newPRButton).toBeVisible({ timeout: 30000 });
            await expect(newPRButton).toBeEnabled({ timeout: 30000 });
            await newPRButton.click();

            const searchPRFields = page.getByRole("textbox", { name: "Search" });
            const supplierPRSearch = searchPRFields.nth(0);
            const grnNumberSearch = searchPRFields.nth(1);
            await supplierPRSearch.pressSequentially(supplier.split(" ")[0], { delay: 30 });

            const supplierPROption = page.getByText(supplier, { exact: true });
            await expect(supplierPROption).toBeVisible({ timeout: 10000 });
            await supplierPROption.click();

            await grnNumberSearch.pressSequentially(grnNumber, { delay: 30 });
            const grnOption = page.getByText(grnNumber, { exact: true }).first();
            await expect(grnOption).toBeVisible({ timeout: 10000 });
            await grnOption.click();

            await page.locator('input[formcontrolname="Qty"]').fill("1");
            await page.locator('input[formcontrolname="Fqty"]').fill("1");

            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 10);
            const futureDatePattern = new RegExp(
                `^${futureDate.getDate()} .* ${futureDate.getFullYear()}$`,
            );
            await page.getByRole("button", { name: "Open calendar" }).first().click();
            await page.getByRole("button", { name: futureDatePattern }).click();

            await page.getByRole("button", { name: "Save" }).click();
            await expect(page.getByText("Record saved successfully")).toBeVisible();
            await expect(page).toHaveURL(
                "https://test.pharmacyplus.app/#/pharmacy/phapurchasereturnlist",
            );

            const purchaseReturnNumber = page.locator("td.mat-column-NumberDisplay").first();
            await expect(purchaseReturnNumber).toBeVisible();
            const purchaseReturnNumberValue = (await purchaseReturnNumber.textContent())?.trim();
            expect(purchaseReturnNumberValue, "Created purchase return should have a number").toBeTruthy();

            return purchaseReturnNumberValue;
        });
    },
});
