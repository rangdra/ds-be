import mongoose from 'mongoose';

const ProbleSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			//   required: true,
		},
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		oldId: {
			type: Number,
		},
	},
	{ timestamps: true }
);

export default mongoose.model('Problem', ProbleSchema);
