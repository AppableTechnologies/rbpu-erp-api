const {pgPool} = require("../../pg_constant");



// module.exports.getMenus = async function getMenus(req, res) {
//     try {
//       const rid=req.params.role_id_fk;
//       console.log("Hey this is the role id of login user: "+rid);
      
//       // console.log("Hey this is the role id of login user: "+rid);
//       // console.log("Hey before hitting the menuQuery");
//       const menuQuery = `
//         SELECT id, title, icon, path, type, slicedpath, active
//         FROM menus
//         WHERE active = true AND role_id_fk = $1
//         ORDER BY menu_order;
//       `;
//       // console.log("Hey before hitting the submenuQuery");

//       const submenuQuery = `
//         SELECT s.submenu_id_pk, s.menu_id_fk, s.title, s.submenu_icon, s.path, s.type
//         FROM submenus s
//         LEFT JOIN menus m ON s.menu_id_fk = m.id
//         WHERE s.is_active = TRUE
//         ORDER BY s.submenu_order;
//       `;
//       // console.log("Hey before running the query");
//       const menuResult = await pgPool.query(menuQuery,[rid]);
//       const submenuResult = await pgPool.query(submenuQuery);

//       const menus = menuResult.rows;
//       const submenus = submenuResult.rows;
//       // console.log(
//       //   "Here is the result of menus and submenus " + menus + submenus
//       // );

//       // Combine menus and submenus
//       const combinedMenus = menus.map((menu) => {
//         const menuSubmenus = submenus.filter(
//           (submenu) => submenu.menu_id_fk === menu.id
//         );
//         return {
//           ...menu,
//           submenus: menuSubmenus,
//         };
//       });

//       res.status(200).json(combinedMenus);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send("Server Error");
//     }
// }



// module.exports.getMenus = async function getMenus(req, res) {
//   try {
//     const rid = req.params.role_id_fk;
//     console.log("Hey this is the role id of login user: " + rid);

//     const menuQuery = `
//       SELECT id, title, icon, path, type, slicedpath, active
//       FROM menus
//       WHERE active = true AND role_id_fk = $1
//       ORDER BY menu_order;
//     `;

//     const submenuQuery = `
//       SELECT s.submenu_id_pk, s.menu_id_fk, s.title, s.submenu_icon, s.path, s.type
//       FROM submenus s
//       LEFT JOIN menus m ON s.menu_id_fk = m.id
//       WHERE s.is_active = TRUE
//       ORDER BY s.submenu_order;
//     `;

//     const menuResult = await pgPool.query(menuQuery, [rid]);
//     const submenuResult = await pgPool.query(submenuQuery);

//     const menus = menuResult.rows;
//     const submenus = submenuResult.rows;

//     const transformedMenus = menus.map((menu) => {
//       const children = submenus
//         .filter((submenu) => submenu.menu_id_fk === menu.id)
//         .map((submenu) => ({
//           path: submenu.path,
//           title: submenu.title,
//           type: submenu.type,
//         }));

//       return {
//         id: menu.id,
//         title: menu.title,
//         icon: menu.icon,
//         type: menu.type,
//         slicedpath: menu.slicedpath,
//         active: menu.active,
//         children,
//       };
//     });

//     res.status(200).json({ Items: transformedMenus });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// };



module.exports.getMenus = async function getMenus(req, res) {
  try {
    const rid = req.params.role_id_fk;
    console.log("Role ID of logged-in user:", rid);

    const menuQuery = `
      SELECT id, title, icon, path, type, slicedpath, active
      FROM menus
      WHERE active = true AND role_id_fk = $1
      ORDER BY menu_order;
    `;

    const submenuQuery = `
      SELECT submenu_id_pk, menu_id_fk, title, submenu_icon, path, type
      FROM submenus
      WHERE is_active = TRUE
      ORDER BY submenu_order;
    `;

    const [menuResult, submenuResult] = await Promise.all([
      pgPool.query(menuQuery, [rid]),
      pgPool.query(submenuQuery),
    ]);

    const menus = menuResult.rows;
    const submenus = submenuResult.rows;

    const transformedMenus = menus.map((menu) => {
      const children = submenus
        .filter((submenu) => submenu.menu_id_fk === menu.id)
        .map((submenu) => ({
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
