import { Feedback } from 'scandit-web-datacapture-core';

var e=class a{constructor(){this.success=Feedback.defaultFeedback;}static get default(){return new a}toJSONObject(){return {success:this.success.toJSONObject()}}};

export { e as a };
