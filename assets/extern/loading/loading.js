const loading = (i, length) => {
	if (i == 0) return null;
	const percent = i / (length - 1);
	console.log(i, percent.toFixed(1), length);
};
