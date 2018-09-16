module.exports = (item, attributes) => {
  const elements = attributes.map((attr) => {
    return `<td> ${item[attr]} </td>`;
  });

  return `<tr>${elements.join('')}</tr>`;
};
