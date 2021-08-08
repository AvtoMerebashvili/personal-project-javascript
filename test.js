class a {
  method(){
    this.b = 20;
  }
}

const f = new a();
f.method();
console.log(f.b)