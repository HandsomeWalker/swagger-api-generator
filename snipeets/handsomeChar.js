function orderChar(str, len) {
  var res = '';
  for (var i = 0; i < len; i++) {
      res += str;
  }
  return res;
}
function randomChar(str, len) {
  var res = '', str_len = str.length;
  for (var i = 0; i < len; i++) {
      res += str[Math.floor(Math.random() * str_len)];
  }
  return res;
}

/**
* NOTE: only 1 param of type string required
* using '|' to split diffrent conditions, result in turn will be outputted according to the sequence of rule
* '1-5': 1~5 in turn
* '(2-9)^2': repeat 2 times of 2~9 in turn
* '(3*7)^5': pick 5 random numbers from range of 3~7
* and so is the "lowerCase" or "upperCase"
* enjoy🙉
* @param {string} rule
* @example handsomeChar('1-5|(2-9)^2|(3*7)^5|a-d|(c-e)^6|(d*g)^5|A-D|(C-E)^6|(D*G)^5')
*/
function handsomeChar(rule) {
  var num = '0123456789',
      upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lower = 'abcdefghijklmnopqrstuvwxyz',
      num_reg = /\d(-|\*)\d/,
      upper_reg = /[A-Z](-|\*)[A-Z]/,
      lower_reg = /[a-z](-|\*)[a-z]/;
  if(typeof rule === 'undefined') {
      return randomChar(num + lower + upper, 4);
  }
  if(Object.prototype.toString.call(rule) !== '[object String]') {
      return '';
  }
  if(/^[0-9]*$/.test(rule)) {
      return randomChar(num + lower + upper, parseInt(rule));
  }
  var matched = rule.match(/(\d-\d)|([a-z]-[a-z])|([A-Z]-[A-Z])|(\(\d-\d\)\^\d)|(\([a-z]-[a-z]\)\^\d)|(\([A-Z]-[A-Z]\)\^\d)|(\(\d\*\d\)\^\d)|(\([a-z]\*[a-z]\)\^\d)|(\([A-Z]\*[A-Z]\)\^\d)/g);
  if(matched === null) {
      return randomChar(num + lower + upper, 4);
  }
  var res = '', temp;
  for (var i = 0, len = matched.length; i < len; i++) {
      var item = matched[i];
      var power = item.match(/\^\d/g);
      power === null ? (power = 1) : (power = power[0][power[0].length - 1]);
      var r = item.match(/[0-9a-zA-Z](?=(-|\*))/g).concat(item.match(/(?<=(-|\*))[0-9a-zA-Z]/g)).join('-');
      r = '[' + r + ']';
      if(num_reg.test(item)) {
          temp = num.match(new RegExp(r, 'g'));
      }else if(upper_reg.test(item)) {
          temp = upper.match(new RegExp(r, 'g'));
      }else if(lower_reg.test(item)) {
          temp = lower.match(new RegExp(r, 'g'));
      }
      if(temp !== null) {
          temp = temp.join('');
      }else {
          temp = '';
      }
      if(/.-./.test(item)) {
          res += orderChar(temp, power);
      }else if(/.\*./.test(item)) {
          res += randomChar(temp, power);
      }
  }
  return res;
}

module.exports = handsomeChar;
