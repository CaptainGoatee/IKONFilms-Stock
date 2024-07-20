var e=class t{get isFixed(){return this.minimum===this.maximum||this.step<=0}get maximum(){return this._maximum}get minimum(){return this._minimum}get step(){return this._step}static fromJSON(i){let m=new t;return m._minimum=i.minimum,m._maximum=i.maximum,m._step=i.step,m}toJSONObject(){return {maximum:this.maximum,minimum:this.minimum,step:this.step}}};

export { e as a };
