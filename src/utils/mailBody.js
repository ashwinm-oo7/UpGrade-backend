export const buildReplyBody = (originalEmail, message) => {
  return `
<br/><br/>
<hr/>
<b>On ${originalEmail.date}, ${originalEmail.from} wrote:</b><br/><br/>

${originalEmail.body}
<br/><br/>

<b>Reply:</b><br/>
${message}
`;
};
