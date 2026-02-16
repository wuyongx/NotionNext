   import type { NextApiRequest, NextApiResponse } from 'next';                                                                                                                    
                                                                                                                                                                                   
   export default async function handler(                                                                                                                                          
     req: NextApiRequest,                                                                                                                                                          
     res: NextApiResponse                                                                                                                                                          
   ) {                                                                                                                                                                             
     // 只接受 POST 请求                                                                                                                                                           
     if (req.method !== 'POST') {                                                                                                                                                  
       return res.status(405).json({ error: 'Method not allowed' });                                                                                                               
     }                                                                                                                                                                             
                                                                                                                                                                                   
     // 验证 Webhook Secret                                                                                                                                                        
     const secret = req.headers['x-webhook-secret'] as string;                                                                                                                     
     if (secret !== process.env.WEBHOOK_SECRET) {                                                                                                                                  
       console.error('Invalid webhook secret');                                                                                                                                    
       return res.status(401).json({ error: 'Unauthorized' });                                                                                                                     
     }                                                                                                                                                                             
                                                                                                                                                                                   
     try {                                                                                                                                                                         
       const deployHook = process.env.VERCEL_DEPLOY_HOOK;                                                                                                                          
       if (!deployHook) {                                                                                                                                                          
         return res.status(500).json({ error: 'VERCEL_DEPLOY_HOOK not configured' });                                                                                              
       }                                                                                                                                                                           
                                                                                                                                                                                   
       console.log('Received Notion webhook, triggering deploy...');                                                                                                               
                                                                                                                                                                                   
       // 触发 Vercel 重新部署                                                                                                                                                     
       const response = await fetch(deployHook, {                                                                                                                                  
         method: 'POST',                                                                                                                                                           
         headers: { 'Content-Type': 'application/json' },                                                                                                                          
       });                                                                                                                                                                         
                                                                                                                                                                                   
       if (response.ok) {                                                                                                                                                          
         const data = await response.json();                                                                                                                                       
         console.log('Deploy triggered:', data);                                                                                                                                   
         return res.status(200).json({                                                                                                                                             
           success: true,                                                                                                                                                          
           message: 'Deploy triggered',                                                                                                                                            
           job: data.job                                                                                                                                                           
         });                                                                                                                                                                       
       } else {                                                                                                                                                                    
         const error = await response.text();                                                                                                                                      
         throw new Error(`Deploy hook failed: ${error}`);                                                                                                                          
       }                                                                                                                                                                           
     } catch (error) {                                                                                                                                                             
       console.error('Webhook error:', error);                                                                                                                                     
       return res.status(500).json({                                                                                                                                               
         error: 'Failed to trigger deploy',                                                                                                                                        
         details: error instanceof Error ? error.message : 'Unknown error'                                                                                                         
       });                                                                                                                                                                         
     }                                                                                                                                                                             
   }
