class APIUtilsPharma{
    constructor(apiContext,loginPayload)
    {
       this.apiContext=apiContext;
       this.loginPayload=loginPayload;
    }
    async getToken()
    {
        const loginResponse = await this.apiContext.post('https://test.pharmacyplus.app/server/api/login/UserVeryfy',
      { data:this.loginPayload },
    );
       const loginResponseJSON = await loginResponse.json();
       this.loginUser = loginResponseJSON;
       const token = loginResponseJSON.Token;
       return token;
    }
    async createGRN(grnPayload)
    {
        let response ={};
        response.token= await this.getToken();
        response.loginUser = this.loginUser;
        const grnorderResponse = await this.apiContext.post(
              'https://test.pharmacyplus.app/server/api/PhaPurchase/CreatePhaPurchase',
              {
                data: grnPayload,
                headers: {
                  Authorization: `Bearer ${response.token}`,
                },
              },
            );
           const responseBody = await grnorderResponse.text();
           const grnorderResponseJSON = JSON.parse(responseBody);
           const grnSuccess= grnorderResponseJSON.IsSuccess;
           response.grnSuccess=grnSuccess;
           return response;
           

    }
}
module.exports={APIUtilsPharma};