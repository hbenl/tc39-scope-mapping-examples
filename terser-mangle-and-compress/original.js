function outer(x) {
  function inner(y) {
    console.log("Hello " + y);
  }
  inner("dear " + x);
}
outer("world");
