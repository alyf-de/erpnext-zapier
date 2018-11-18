/*
Zapier App to automate ERPNext.
Copyright (C) 2018  Raffael Meyer

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
const addId = doc => {
  // zapier requires that every object has a unique ID,
  // which is returned as 'name' by ERPNext.
  if (doc.hasOwnProperty('name')) {
    // copy name to id
    return Object.assign(doc, { id: doc.name });
  }
  return doc;
};

const listToObject = list =>
  // turn [{key: x, label: y}, {key: a, label: b}] into {x: y, a: b}
  list.reduce((o, a) => Object.assign({}, o, { [a.key]: a.label }), {});

const removeItem = (arr, item) => {
  // remove item from array
  var index = arr.indexOf(item);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
};

const uniqueItems = arr =>
  // for each element, check if the first position of this element in the array
  // is equal to the current position. These two positions are different for
  // duplicate elements, so they will be filtered out.
  arr.filter(function(item, pos) {
    return arr.indexOf(item) === pos;
  });

module.exports = {
  removeItem,
  uniqueItems,
  addId,
  listToObject,
};
