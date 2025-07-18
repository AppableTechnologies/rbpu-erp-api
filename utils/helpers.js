// module.exports.generateSlug = function generateSlug(text) {
//   return text
//     .trim()
//     .toLowerCase()
//     .replace(/[^\w\s-]/g, '')
//     .replace(/\s+/g, '-')
//     .replace(/-+/g, '-')
// }


// module.exports.getUniqueSlug = function getUniqueSlug(baseSlug, existingSlugs) {
//   if (!existingSlugs?.includes(baseSlug)) return baseSlug;

//   let counter = 1;
//   let newSlug;
//   do {
//     newSlug = `${baseSlug}-${counter}`;
//     counter++;
//   } while (existingSlugs.includes(newSlug));

//   return newSlug;
// }