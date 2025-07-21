module.exports.generateSlug = function generateSlug(text) {
  return text
    .normalize("NFD") // decompose accented letters
    .replace(/[\u0300-\u036f]/g, "") // remove diacritical marks
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove all non-word chars except spaces and hyphens
    .replace(/\s+/g, "-") // convert spaces to hyphens
    .replace(/-+/g, "-"); // collapse multiple hyphens
};

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
