import {registerUserAPI} from "../apis";
import { apiConnector } from "../apiConnector";
import { setUserData,setUserRole,setToken } from "../../slices/authSlice";


const {
    REGISTER_USER,  
    GET_OTP,
    VERIFY_EMAIL,
    LOG_IN,
    FORGOT_PASSWORD,
    RESET_PASSWORD,
    GET_ALL_USERS  
} = registerUserAPI   

export function getOtp({email,username,password,role}) {
  return async () => {
    try {
    console.log("REGISTER_API",REGISTER_USER);
    const responseRegister = await apiConnector("POST",REGISTER_USER, {
        email,
        username,
        password,
        role
      });
      console.log("REGISTER_API RESPONSE",responseRegister);
      if(!responseRegister.status == 200){
        throw new Error(responseRegister.data.message)
      }
      console.log("GET_OTP",GET_OTP);
      const response = await apiConnector("POST",GET_OTP, {
        email,
        forceSend: true,
      })
      console.log("SENDOTP API RESPONSE............", response)

      console.log(response.data.success)

      if (!response.status == 200) {
        throw new Error(response.data.message)
      }
      
    } catch (error) {
      console.log("SENDOTP API ERROR....", error)
    //   toast.error("Could Not Send OTP")
    }
  }
}

export function register({email,otp,navigate}) {
  return async () => {
    try {
    console.log("VERIFY_EMAIL",VERIFY_EMAIL);
    const responseRegister = await apiConnector("POST",VERIFY_EMAIL, {
        email,
        otp
      });
      if(!responseRegister.status == 200){
        throw new Error(responseRegister.data.message)
      }
      console.log("VERIFY_EMAIL API RESPONSE............", responseRegister)
      navigate('/login');
    } 
    catch (error) {
      console.log("VERIFY_EMAIL API ERROR....", error)
    //   toast.error("Could Not Verify Email")
    }
  }
}

//ToDo
export function login({email,password,navigate}) {
  return async (dispatch) => {
    try {
    console.log("LOGIN_API",LOG_IN);
    const responseLogin = await apiConnector("POST",LOG_IN, {
        email,
        password,
      });
      if(!responseLogin.status == 200 ){
        throw new Error(responseLogin.data.message)
      }
      console.log("LOGIN_RESPONSE............", responseLogin)

      console.log("LOGIN_USER_DATA............", responseLogin.data.token)
      console.log("LOGIN_TOKEN............", responseLogin.data.token.jwtToken)
      console.log("LOGIN_USER_ID............", responseLogin.data.token.userId)
      console.log("LOGIN_USER_NAME............", responseLogin.data.token.userName)
      console.log("LOGIN_USER_EMAIL............", responseLogin.data.token.userEmail)
      console.log("LOGIN_USER_ROLE............", responseLogin.data.token.userRole)

      dispatch(setUserData({userId:responseLogin.data.token.userId ,userName: responseLogin.data.token.userName , email: responseLogin.data.token.userEmail}));
      dispatch(setUserRole(responseLogin.data.token.userRole));
      dispatch(setToken(responseLogin.data.token.jwtToken));
      localStorage.setItem("token", JSON.stringify(responseLogin.data.token.jwtToken));
      localStorage.setItem("userData", JSON.stringify({userId:responseLogin.data.token.userId ,userName: responseLogin.data.token.userName , email: responseLogin.data.token.userEmail, role: responseLogin.data.token.userRole}));
      localStorage.setItem("userRole", JSON.stringify(responseLogin.data.token.userRole));
      navigate('/dashboard/my-profile');
    } catch (error) {
      console.log("LOGIN_API_ERROR....", error)
      return false;
    //   toast.error("Could Not Send OTP")
    }
  }
}

export function forgotPassword({email}) {
  return async () => {
    try {
    console.log("FORGOT_PASSWORD",FORGOT_PASSWORD);
    const response = await apiConnector("POST",FORGOT_PASSWORD, {
        email,
      });
      console.log("FORGOT_PASSWORD API RESPONSE............", response)
      if (!response.status == 200) {
        throw new Error(response.data.message)
      }
      return true;
    } catch (error) {
      console.log("FORGOT_PASSWORD API ERROR....", error)
      return false;
    }
  }
}

export function resetPassword({email,otp,newPassword,navigate}) {
  return async () => {
    try {
    console.log("RESET_PASSWORD",RESET_PASSWORD);
    const response = await apiConnector("POST",RESET_PASSWORD, {
        email,
        otp,
        newPassword
    });
      console.log("RESET_PASSWORD API RESPONSE............", response)
      if (!response.status == 200) {
        throw new Error(response.data.message)
      }
      navigate('/login');
    } catch (error) {
      console.log("RESET_PASSWORD API ERROR....", error)
      return false
    }
}
}


export function getAllUser({token}){
  return async () => {
    try {
    console.log("GET_ALL_USERS",GET_ALL_USERS);
    const response = await apiConnector("GET",GET_ALL_USERS,{},{Authorization: `Bearer ${token}`});
      console.log("GET_ALL_USERS API RESPONSE............", response)
      if (!response.status == 200) {
        throw new Error(response.data.message)
      }
      return response.data;
    } catch (error) {
      console.log("GET_ALL_USERS API ERROR....", error)
      return false
    }
}
}
 