const { Menu, Submenu } = require("../../models"); // This pulls from models/index.js

module.exports.getMenus = async function getMenus(req, res) {
  try {
    const rid = req.params.role_id_fk;
    console.log("Role ID of logged-in user:", rid);

    const menus = await Menu.findAll({
      where: {
        active: true,
        role_id_fk: rid,
      },
      order: [["menu_order", "ASC"]],
      include: [
        {
          model: Submenu,
          as: "submenus",
          where: {
            is_active: true,
          },
          required: false,
          order: [["submenu_order", "ASC"]],
          attributes: [
            "submenu_id_pk",
            "menu_id_fk",
            "title",
            "submenu_icon",
            "path",
            "type",
          ],
        },
      ],
      attributes: [
        "id",
        "title",
        "icon",
        "path",
        "type",
        "slicedpath",
        "active",
      ],
    });

    // const menuQuery = `
    //   SELECT id, title, icon, path, type, slicedpath, active
    //   FROM menus
    //   WHERE active = true AND role_id_fk = $1
    //   ORDER BY menu_order;
    // `;

    // const submenuQuery = `
    //   SELECT submenu_id_pk, menu_id_fk, title, submenu_icon, path, type
    //   FROM submenus
    //   WHERE is_active = TRUE
    //   ORDER BY submenu_order;
    // `;

    // const [menuResult, submenuResult] = await Promise.all([
    //   pgPool.query(menuQuery, [rid]),
    //   pgPool.query(submenuQuery),
    // ]);

    // const menus = menuResult.rows;
    // const submenus = submenuResult.rows;

    // Transform to your desired format
    const transformedMenus = menus.map((menu) => {
      const children = (menu.submenus || []).map((submenu) => ({
        path: submenu.path,
        title: submenu.title,
        type: submenu.type,
      }));

      return {
        id: menu.id,
        title: menu.title,
        icon: menu.icon,
        type: menu.type,
        slicedpath: menu.slicedpath,
        active: menu.active,
        ...(children.length > 0 && { children }),
      };
    });

    // const transformedMenus = menus.map((menu) => {
    //   const children = submenus
    //     .filter((submenu) => submenu.menu_id_fk === menu.id)
    //     .map((submenu) => ({
    //       path: submenu.path,
    //       title: submenu.title,
    //       type: submenu.type,
    //     }));

    //   return {
    //     id: menu.id,
    //     title: menu.title,
    //     icon: menu.icon,
    //     type: menu.type,
    //     slicedpath: menu.slicedpath,
    //     active: menu.active,
    //     ...(children.length > 0 && { children }),
    //   };
    // });

    // Wrap with category object
    const response = [
      {
        title: "General",
        menucontent: "General",
        Items: transformedMenus,
      },
    ];

    return res.status(200).json(response);
  } catch (err) {
    console.error("Menu Fetch Error:", err.message);
    return res.status(500).send("Server Error");
  }
};

// **************************  
// module.exports.getMenus = async function getMenus(req, res) {
//   try {
//     const rid = req.params.role_id_fk;
//     console.log("Role ID of logged-in user:", rid);

//     const menus = await Menu.findAll({
//       where: {
//         active: true,
//         role_id_fk: rid,
//       },
//       order: [["menu_order", "ASC"]],
//       include: [
//         {
//           model: Submenu,
//           as: "submenus",
//           where: {
//             is_active: true,
//           },
//           required: false,
//           order: [["submenu_order", "ASC"]],
//           attributes: [
//             "submenu_id_pk",
//             "menu_id_fk",
//             "title",
//             "submenu_icon",
//             "path",
//             "type",
//           ],
//         },
//       ],
//       attributes: [
//         "id",
//         "title",
//         "icon",
//         "path",
//         "type",
//         "slicedpath",
//         "active",
//       ],
//     });

//     // Transform to your desired format
//     const transformedMenus = menus.map((menu) => {
//       const children = (menu.submenus || []).map((submenu) => ({
//         path: submenu.path,
//         title: submenu.title,
//         type: submenu.type,
//       }));

//       return {
//         id: menu.id,
//         title: menu.title,
//         icon: menu.icon,
//         type: menu.type,
//         slicedpath: menu.slicedpath,
//         active: menu.active,
//         ...(children.length > 0 && { children }),
//       };
//     });

//     // Return just the transformed menus without the category wrapper
//     return res.status(200).json(transformedMenus);
//   } catch (err) {
//     console.error("Menu Fetch Error:", err.message);
//     return res.status(500).send("Server Error");
//   }
// };







