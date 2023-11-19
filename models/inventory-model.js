const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}


/* ***************************
 *  Get all inventory vehicles and inv_make by inv_id
 * ************************** */
async function getInventoryByInventoryId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory
      WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows
  } catch (error) {
    console.error("getinventoryid error " + error)
  }
}

/* ***************************
 *  Add new classification to the classification tb
 * ************************** */
async function addNewClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    // console.error("addnewclassification error" +error)
    return error.message
  }
}

/* ***************************
 *  Add new inventory to the inventory table
 * ************************** */
async function addNewInventory(classification_name, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_year, inv_miles, inv_color) {
  try {
    const sql = "INSERT INTO inventory (classification_name, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_year, inv_miles, inv_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *"
    return await pool.query(sql, [classification_name, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_year, inv_miles, inv_color])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Check for existing classification
 * ************************** */
async function checkExistingClassificationName(classification_name) {
  try {
    const sql = "SELECT * FROM classification where classification_name = $1"
    const classification = await pool.query(sql, [classification_name])
    return classification.rowCount
  } catch (error) {
    return error.message
  }
}

module.exports = {getClassifications, getInventoryByClassificationId,getInventoryByInventoryId, addNewClassification, checkExistingClassificationName, addNewInventory};