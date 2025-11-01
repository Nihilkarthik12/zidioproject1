import React, { useState } from "react";

const UploadTest = () => {
	const [file, setFile] = useState(null);
	const [message, setMessage] = useState("");
	const [uploading, setUploading] = useState(false);

	const handleFileChange = (e) => {
		setFile(e.target.files[0]);
		setMessage("");
	};

	const handleUpload = async () => {
		if (!file) {
			setMessage("Please select a file.");
			return;
		}
		setUploading(true);
		setMessage("");
		const formData = new FormData();
		formData.append("file", file);
		try {
			const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
			const response = await fetch(`${apiUrl}/upload/simple`, {
				method: "POST",
				body: formData,
			});
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || "Upload failed");
			}
			const data = await response.json();
			setMessage(`File uploaded successfully! Rows: ${data.rowCount || 0}`);
		} catch (error) {
			setMessage("Error uploading file: " + error.message);
		} finally {
			setUploading(false);
		}
	};

	return (
		<div>
			<h2>Upload Excel File (Test - No Auth)</h2>
			<input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
			<button onClick={handleUpload} disabled={uploading} style={{ marginLeft: 8 }}>
				{uploading ? "Uploading..." : "Upload"}
			</button>
			{message && <div style={{ marginTop: 10 }}>{message}</div>}
		</div>
	);
};

export default UploadTest;