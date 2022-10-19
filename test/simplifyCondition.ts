const a = 0, b = 2;

// if (true && a < b) {
//   console.log('hello 1');
// } else {
//   console.log('hello 2');
// }

// if (true && a < b) {
//   console.log('hello 3');
// } else if (a < b) {
//   console.log('hello 4');
// } else {
//   console.log('hello 5')
// }

if(true && (a && true) || (b || true)) {
  console.log('11');

}

// if((a && true) || (b || true)) {
//   console.log('x');
  
// }

// if((true && a && true)) {
//   console.log('x');
// }

// if(true && a && true) {
//   console.log('x');
// }

// if(b || true) {
//   console.log('1');
// }

// if(a && true) {
//   console.log('x');
// }