const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuitemsRouter = require('./menu-items');

module.exports = menusRouter;

menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id=$menuId';
  const values = {
    $menuId: menuId
  };

  db.get(sql, values, (error, menu) => {
    if(error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuitemsRouter);

menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (error, menus) => {
    if(error) {
      next(error);
    } else {
      res.status(200).json({menus: menus});
    }
  });
});

menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Menu (title) VALUES ($title)';
  const values = {
    $title: title
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
        (error, menu) => {
          res.status(201).json({menu: menu});
        });
    }
  });
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
  next();
});

menusRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Menu SET title=$title WHERE Menu.id=$menuId';
  const values = {
    $title: title,
    $menuId: req.params.menuId
  };

  db.run(sql, values, function(error) {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
        (error, menu) => {
          res.status(200).json({menu: menu});
        });
    }
  });
});

menusRouter.delete('/:menuId', (req, res, next) => {
  const itemSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id=$menuId';
  const itemValues = {
    $menuId: req.params.menuId
  };
  db.get(itemSql, itemValues, (error, items) => {
    if(error) {
      next(error);
    } else if (items) {
      res.sendStatus(400);
    } else {
      db.run(`DELETE FROM Menu WHERE Menu.id=${req.params.menuId}`, function(error) {
        if(error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});

