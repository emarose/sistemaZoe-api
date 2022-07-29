const hojasRutaModel = require("../models/hojasRutaModel");
const pagosModel = require("../models/pagosModel");
const movimientosModel = require("../models/movimientosModel");
const titularesModel = require("../models/titularesModel");
const cuentasCorrientesModel = require("../models/cuentasCorrientesModel");
const formatDateString = require("../util/utils.js");
const PDFDocumentTable = require("pdfkit-table");
/* const PDFDocument = require("pdfkit"); */

const fs = require("fs");

module.exports = {
  entrefechas: async function (req, res, next) {
    function formatNumberToCurrency(num) {
      let strNum = num.toFixed(2).replace(".", ",");
      return `$ ${String(strNum).replace(
        /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
        "$1."
      )}`;
    }

    console.log(req.body.data);

    const { initDate, endDate, codigo, CC_id } = req.body.data;
    console.log("ID:", CC_id);
    try {
      const fechaDesde = formatDateString(new Date(initDate));
      const fechaHasta = formatDateString(new Date(endDate));

      const findMovementsBetweenDates = await movimientosModel.find({
        fecha: {
          $gte: new Date(initDate),
          $lte: new Date(endDate),
        },
        cliente: codigo,
      });

      const findPagosBetweenDates = await pagosModel.find({
        /*       fecha: {
          $gte: fechaDesde,
          $lte: fechaHasta,
        }, */
        cliente: codigo,
      });
      /* 
      const findCC = await cuentasCorrientesModel.find({ _id: CC_id });

      console.log("CC:", findCC.saldo); */

      const pagosMovimientos = [
        ...findPagosBetweenDates,
        ...findMovementsBetweenDates,
      ];
      let arr = [];

      let cajas;
      let kgCong;

      for (let i = 0; i < pagosMovimientos.length; i++) {
        if (!pagosMovimientos[i].cajas) {
          cajas = "";
        } else {
          cajas = `${pagosMovimientos[i].cajas} Cajas\n `;
        }

        if (!pagosMovimientos[i].kgCong) {
          kgCong = "";
        } else {
          kgCong = `${pagosMovimientos[i].kgCong} Kg. Congelado\n`;
        }
        if (!pagosMovimientos[i].importe) {
          data = {
            cliente: pagosMovimientos[i].cliente,
            fecha: pagosMovimientos[i].fecha,
            concepto: pagosMovimientos[i].concepto,
            monto: formatNumberToCurrency(pagosMovimientos[i].monto),
            importe: "------------",
          };
        } else {
          data = {
            cliente: pagosMovimientos[i].cliente,
            fecha: pagosMovimientos[i].fecha,
            concepto: `${cajas}${kgCong} Planta: ${pagosMovimientos[i].planta} \n Vehículo: ${pagosMovimientos[i].vehiculo}`,
            monto: "-------------",
            importe: formatNumberToCurrency(pagosMovimientos[i].importe),
          };
        }
        arr.push(data);
      }

      const doc = new PDFDocumentTable({
        margin: 30,
        size: "A4",
      });

      doc.pipe(fs.createWriteStream("Exported/ListadoEntreFechas.pdf"));
      res.setHeader("Content-type", "application/pdf");
      doc.pipe(res);

      doc.fontSize(16).font("Helvetica").text("Transporte Zoe").moveDown();

      const table = {
        title: `Resumen entre fechas:  ${fechaDesde} - ${fechaHasta}`,
        subtitle: `Fecha de emisión:  ${new Date().toLocaleDateString()}`,
        headers: [
          {
            label: "Codigo",
            property: "cliente",
            valign: "center",
            align: "center",
          },
          {
            label: "Fecha",
            property: "fecha",
            valign: "center",
            align: "center",
          },
          {
            label: "Concepto",
            property: "concepto",
            valign: "center",
            align: "center",
          },

          {
            label: "Debe",
            property: "importe",
            valign: "center",
            align: "center",
          },
          {
            label: "Haber",
            property: "monto",
            valign: "center",
            align: "center",
          },

          {
            label: "Saldo",
            property: "saldo",
            valign: "center",
            align: "center",
          },
          /* 
          {
            label: "Importe",
            property: "importe",
            valign: "center",
            align: "center",
            width: 100,
          }, */
        ],
        datas: arr,
      };

      const saldoTable = {
        headers: [
          {
            label: "",
            property: "",
            valign: "center",
            align: "center",
          },
          {
            label: "",
            property: "",
            valign: "center",
            align: "center",
          },
          {
            label: "",
            property: "",
            valign: "center",
            align: "center",
          },

          {
            label: "Debe",
            property: "importe",
            valign: "center",
            align: "center",
          },
          {
            label: "Haber",
            property: "monto",
            valign: "center",
            align: "center",
          },

          {
            label: "Saldo",
            property: "saldo",
            valign: "center",
            align: "center",
          },
        ],
        datas: arr,
      };
      const options = {};
      const callback = () => {};
      doc.table(table, options, callback);

      doc.end();
    } catch (e) {
      next(e);
    }
  },
};
