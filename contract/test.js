var deploy = require('./deploy');
async function t(){
  var d = await deploy();
  console.log("success: ",d.interface)
  console.log("success: ",d.address)
}
t()
// console.log(compile.interface)
// console.log(compile.bytecode)
