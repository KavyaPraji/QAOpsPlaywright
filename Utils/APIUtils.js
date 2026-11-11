class APIUtils{

    constructor(apiContext,loginPayload)
    {
       this.apiContext=apiContext;
       this.loginPayload=loginPayload;
    }

    async  getToken()
    {
       const loginResponse=await this.apiContext.post('https://rahulshettyacademy.com/api/ecom/auth/login', 
        {
        data:this.loginPayload,
    })
     const loginResponseJSON=await loginResponse.json();
     const token=loginResponseJSON.token;
    return token;
  
    }
    async createOrder(orderPayLoad)
    {
        let response ={};
        response.token=await this.getToken();
        const orderResponse=await this.apiContext.post('https://rahulshettyacademy.com/api/ecom/order/create-order',
              {
                 data:orderPayLoad,
                 headers:{
                    'Authorization' :response.token,
                    'Content-Type' :'application/json'
                 }
        
            })
            const orderResponseJSON=await orderResponse.json();
            const orderId=orderResponseJSON.orders[0];
            response.orderId=orderId;
            return response;
            
    }
}
module.exports={APIUtils};
