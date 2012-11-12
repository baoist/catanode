Array.prototype.last = function() {
  return this[this.length - 1];
};

String.prototype.port = function() {
  return parseInt(this.split('/').last().split(/[^0-9]/)[0]);
};

String.prototype.includes = function(matcher) {
  var includes = false;
  if( this.indexOf( matcher ) > 0 ) {
    includes = true;
  } 

  return includes;
}

Array.prototype.includes = function(matcher) {
  var includes = false
    , arr = this;

  for( var j = 0, str; str = arr[j++]; ) {
    if( typeof str === "string" && str.includes(matcher) ) {
      includes = true;
    }
  }

  return includes;
}
