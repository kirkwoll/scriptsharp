///////////////////////////////////////////////////////////////////////////////
// Assembly

ss.Assembly = function#? DEBUG Assembly$##(name) {
    this.fullName = name;                                                       
    this._types = [];                                                     
}

ss.Assembly.prototype = {
    getTypes: function#? DEBUG Assembly$getTypes##() {
        return this._types;
    }
};

ss.Assembly.registerClass('mscorlib', 'Assembly');
