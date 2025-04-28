import crypto from 'crypto';


export default class globalOps {

  static length = 64; //default length of random string`
  
  //return current date time.
  static currentDateTime() {
    let ct_ = new Date();
    let dd = String(ct_.getDate()).padStart(2, "0");
    let mm = String(ct_.getMonth() + 1).padStart(2, "0"); //January is 0!
    let yyyy = ct_.getFullYear();
    let hrs = ct_.getHours();
    let min = ct_.getMinutes();

    if(min.length == 1){
      min = "0" + min;
    }
    if(hrs.length == 1){
      hrs = "0" + hrs;
    }
    var str = "";    
    ct_ = str.concat(dd, '/', mm, '/', yyyy, " ", hrs, ":", min);
    return ct_;
  }

  static hashText = function (text, key) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(text);
    return hmac.digest('hex');
  };
  
  static generateRandomString = function (length) {
    return crypto.randomBytes(length).toString('hex');
  };

}

