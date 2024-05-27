function outer(num) {
  function inner(value) {
    const value_plus_one = value + 1;
    console.log(value_plus_one);
  }
  const num_plus_one = num + 1;
  inner(num_plus_one);
}
outer(1);
