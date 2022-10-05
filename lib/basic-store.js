module.exports = class BasicStore {
  #dict = {};

  set(k, v) {
    this.#dict[k] = v;
    return this;
  }

  get(k) {
    return this.#dict[k];
  }

  remove(k) {
    delete this.#dict[k];
    return this;
  }
};
