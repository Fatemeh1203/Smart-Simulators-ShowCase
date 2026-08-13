// Farsi number conversion utility

export function toFaDigit(num: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, x => farsiDigits[parseInt(x)]);
}

export function toEnDigit(str: string): string {
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(persianDigits[i], i.toString());
  }
  return result;
}

export function numberToWordsFa(num: number): string {
  if (num === 0) return 'صفر';

  const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const tens = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  const hundreds = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const scales = ['', 'هزار', 'میلیون', 'میلیارد'];

  function getGroupWords(n: number): string {
    if (n === 0) return '';
    const parts: string[] = [];
    
    const h = Math.floor(n / 100);
    const rem = n % 100;
    const t = Math.floor(rem / 10);
    const o = rem % 10;

    if (h > 0) parts.push(hundreds[h]);
    
    if (rem >= 10 && rem < 20) {
      parts.push(teens[rem - 10]);
    } else {
      if (t > 0) parts.push(tens[t]);
      if (o > 0) parts.push(ones[o]);
    }

    return parts.join(' و ');
  }

  let temp = num;
  const groups: number[] = [];
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  const fullParts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g > 0) {
      const gWord = getGroupWords(g);
      const scaleWord = scales[i];
      fullParts.push(scaleWord ? `${gWord} ${scaleWord}` : gWord);
    }
  }

  return fullParts.join(' و ');
}
