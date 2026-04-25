export function calcPrice(daily: number, weekly: number, monthly: number, days: number) {
  if (days >= 28) {
    const months = Math.floor(days / 28);
    const rem = days % 28;
    return months * monthly + rem * daily;
  }
  if (days >= 7) {
    const weeks = Math.floor(days / 7);
    const rem = days % 7;
    return weeks * weekly + rem * daily;
  }
  return days * daily;
}

export function daysBetween(a: string, b: string) {
  return Math.max(1, Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const philippinePhoneRegex = /^(\+63|0)?9\d{9}$/;
  const cleaned = phone.replace(/\D/g, '');
  return philippinePhoneRegex.test(cleaned);
}

export function validatePickupDate(pickupDate: string): boolean {
  const date = new Date(pickupDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

export function validateReturnDate(pickupDate: string, returnDate: string): boolean {
  const pickup = new Date(pickupDate);
  const returnD = new Date(returnDate);
  return returnD > pickup;
}
