export function textValidate (rule: any, value: string, callback: any) {
  if (!value) {
    callback()
    return
  }

  if (value.length > 16) {
    callback(new Error('最多16个字符'))
  } else {
    callback()
  }
}

export const amountValidate = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
    return
  }
  if (!String(value).match(/^\d+$/) || (value.length > 1 && value == 0)) {
    callback(new Error('请输入正确的正整数'))
    return
  }
  callback()
}

export const numValidate = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
    return
  }
  if (!String(value).match(/^\d+$/) || (value.length > 1 && value == 0)) {
    callback(new Error('请输入正确的正整数'))
    return
  }
  if (+value > 30 || +value <= 0 || !String(value).match(/^\d+$/)) {
    callback(new Error('1-99'))
    return
  }
  callback()
}