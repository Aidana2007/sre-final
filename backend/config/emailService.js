// SMTP/email sending disabled. To enable, set SMTP_ vars in `.env` and recreate transporter.
export const sendPasswordResetEmail = async (email, username, token) => {
  console.warn('sendPasswordResetEmail called but SMTP is disabled.');
  return Promise.resolve();
};

export const sendTaskAssignmentEmail = async (email, username, taskTitle, assignedByName) => {
  console.warn('sendTaskAssignmentEmail called but SMTP is disabled.');
  return Promise.resolve();
};