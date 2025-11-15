

export const successHandler = ({res , status = 200 , msg = "done" , data}) =>{
   return res.status(status).json({ message: msg , data  , status  });
}