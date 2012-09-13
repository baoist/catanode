Array.prototype.last = function() {
  return this[this.length - 1];
};

String.prototype.port = function() {
  return parseInt(this.split('/').last().split(/[^0-9]/)[0]);
};
