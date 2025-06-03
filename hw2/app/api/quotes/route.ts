import { NextRequest, NextResponse } from 'next/server';

const quotes = [
  { id: 1, text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { id: 2, text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { id: 3, text: "The mind is everything. What you think you become.", author: "Buddha" },
  { id: 4, text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { id: 5, text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { id: 6, text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  { id: 7, text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { id: 8, text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { id: 9, text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { id: 10, text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { id: 11, text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { id: 12, text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { id: 13, text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { id: 14, text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { id: 15, text: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const getAll = searchParams.get('all');

  if (getAll === 'true') {
    return NextResponse.json(quotes);
  } else {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    return NextResponse.json(randomQuote);
  }
}