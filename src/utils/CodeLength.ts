// remove all spaces and return number of characters used
export default function getCodeLength(code: string): number {
  return code.replace(/\s/g, '').length;
}
