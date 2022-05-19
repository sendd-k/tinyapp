let array = [1, 2, 2, 4, 2]
let newArr = []
for(let i = 0; i < array.length; i++) {
  newArr.push(array[3]);
};

newArr = newArr[0]
newArr = newArr.toString()
newArr = parseInt(newArr)
console.log(newArr)
console.log(typeof newArr)