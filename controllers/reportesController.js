const hojasRutaModel = require("../models/hojasRutaModel");
const movimientosModel = require("../models/movimientosModel");

const PDFDocumentTable = require("pdfkit-table");
const moment = require("moment");
const fs = require("fs");
const { startOfDay, endOfDay } = require("date-fns");
const { formatDateString, formatNumberToCurrency } = require("../util/utils");

module.exports = {
  resumenCuentaCorriente: async function (req, res, next) {
    const { initDate, endDate, codigo } = req.body.data;

    const fechaInicio = new Date(initDate);

    fechaInicio.setHours(4);
    fechaInicio.setMinutes(0);
    fechaInicio.setMilliseconds(0);
    fechaInicio.setSeconds(0);

    const fechaFin = new Date(endDate);
    fechaFin.setHours(4);
    fechaFin.setMinutes(0);
    fechaFin.setMilliseconds(0);
    fechaFin.setSeconds(0);

    try {
      const dataMovimientos = await movimientosModel
        .find({
          fecha: {
            $gte: startOfDay(fechaInicio),
            $lte: endOfDay(fechaFin),
          },
          cliente: codigo,
          isDeleted: false,
        })
        .sort({ fecha: 1 });

      if (dataMovimientos.length === 0) {
        return res
          .status(402)
          .json("No hay movimientos entre las fechas seleccionadas");
      }

      const movimientos = JSON.parse(JSON.stringify(dataMovimientos));

      let sumaPagos = 0;
      let sumaMovimientos = 0;

      movimientos.map((movimiento) => {
        switch (movimiento.tipo) {
          case "ENTRADA":
            sumaPagos += movimiento.importe;
            break;
          case "SALIDA":
            sumaMovimientos += movimiento.importe;

            break;
        }
        Object.assign(movimiento, {
          saldo: sumaMovimientos - sumaPagos || movimiento.importe,
        });
      });

      if (movimientos.length !== 0) {
        let arr = [];
        let data = {};

        let cajas;
        let kgCong;
        let totalImporte = 0;
        let totalCajas = 0;
        let totalKgCong = 0;

        movimientos.map((movimiento) => {
          !movimiento.cajas
            ? (cajas = "")
            : (cajas = `${
                movimiento.cajas === 1
                  ? movimiento.cajas + " Caja"
                  : movimiento.cajas + " Cajas"
              }  \n`);

          !movimiento.kgCong
            ? (kgCong = "")
            : (kgCong = `${movimiento.kgCong} Kg. Congelado\n`);

          switch (movimiento.tipo) {
            case "ENTRADA":
              data = {
                planta: "",
                vehiculo: "",
                cliente: movimiento.cliente.toUpperCase(),
                fecha: moment(movimiento.fecha).format("DD/MM/YYYY"),
                concepto: movimiento.concepto?.toUpperCase(),
                debe: "-",
                haber: formatNumberToCurrency(movimiento.importe),
                saldo: formatNumberToCurrency(movimiento.saldo),
              };

              break;
            case "SALIDA":
              data = {
                planta: movimiento.planta?.toUpperCase(),
                vehiculo: movimiento.vehiculo,
                cliente: movimiento.cliente.toUpperCase(),
                fecha: moment(movimiento.fecha).format("DD/MM/YYYY"),
                concepto:
                  movimiento.concepto?.toUpperCase() ||
                  `${cajas}${kgCong}Planta: ${movimiento.planta?.toUpperCase()}\nVehículo: ${
                    movimiento.vehiculo
                  }`,
                debe: formatNumberToCurrency(movimiento.importe),
                haber: "-",
                saldo: formatNumberToCurrency(movimiento.saldo),
              };

              break;

            default:
              break;
          }

          totalCajas += movimiento.cajas || null;
          totalKgCong += movimiento.kgCong || null;

          totalImporte = formatNumberToCurrency(sumaMovimientos - sumaPagos);
          arr.push(data);
        });

        arr.push({
          importe: "Saldo período:",
          saldo: {
            label: totalImporte,
            options: { fontFamily: "Courier-Bold" },
          },
        });

        const desde = formatDateString(fechaInicio);
        const hasta = formatDateString(fechaFin);
        const emision = formatDateString(new Date());

        /* COMIENZO DOCUMENTO PDF */
        const doc = new PDFDocumentTable({
          margin: 20,
          size: "A4",
        });

        doc.pipe(fs.createWriteStream("Exported/resumenCuentaCorriente.pdf"));
        res.setHeader("Content-type", "application/pdf");
        doc.pipe(res);

        /* titulo */
        doc
          .fontSize(20)
          .font("Courier-BoldOblique")
          .text("Transporte Zoe")
          .moveDown();
        doc.rect(17, 12, 175, 30).strokeColor("grey").stroke();

        const table = {
          title: `Resumen entre fechas:  ${desde} - ${hasta}`,
          subtitle: `Fecha de emisión:  ${emision}`,
          headers: [
            {
              label: "Codigo",
              property: "cliente",
              valign: "center",
              align: "center",
              width: 65,
            },
            {
              label: "Fecha",
              property: "fecha",
              valign: "center",
              align: "center",
              width: 60,
            },
            {
              label: "Concepto",
              property: "concepto",
              valign: "center",
              align: "center",
              width: 170,
            },
            {
              label: "Debe",
              property: "debe",
              valign: "center",
              align: "center",
              width: 80,
            },
            {
              label: "Haber",
              property: "haber",
              valign: "center",
              align: "center",
              width: 80,
            },

            {
              label: "Saldo",
              property: "saldo",
              valign: "center",
              align: "center",
              width: 100,
            },
          ],
          datas: arr,
        };

        const options = {
          x: 0,
          rowSpacing: 10,
          colSpacing: 10,
          minRowHeight: 25,
          divider: {
            header: { disabled: false, width: 1, opacity: 1 },
          },
          // functions
          prepareHeader: () => doc.font("Courier-Bold").fontSize(10),
          prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font("Courier").fontSize(10);

            row.debe === "-"
              ? doc.addBackground(rectRow, "purple", 0.01)
              : null;

            indexRow % 2 !== 0 && doc.addBackground(rectRow, "grey", 0.006);
          },
        };
        const callback = () => {};
        doc.table(table, options, callback);

        doc
          .moveDown(2)
          .fontSize(11)
          .font("Courier-Bold")
          .text("Datos del período");

        doc
          .moveDown()
          .fontSize(10)
          .font("Courier")
          .text("Cantidad de cajas: ", { continued: true })
          .font("Courier-Bold")
          .text(totalCajas);

        doc
          .moveDown()
          .fontSize(10)
          .font("Courier")
          .text("Kg de congelado: ", { continued: true })
          .font("Courier-Bold")
          .text(totalKgCong);
        doc
          .moveDown()
          .fontSize(10)
          .font("Courier")
          .text("Importe del período: ", { continued: true })
          .font("Courier-Bold")
          .text(totalImporte);

        doc.end();
      } else {
        res.status(205).send("sin datos");
      }
    } catch (e) {
      next(e);
    }
  },
  resumenHoja: async function (req, res, next) {
    const initDate = req.body.fecha;

    const fecha = new Date(initDate);

    try {
      const hojaDeRuta = await hojasRutaModel.findOne({
        fecha: {
          $gte: startOfDay(fecha),
          $lte: endOfDay(fecha),
        },
      });

      console.log(hojaDeRuta.movimientos);

      const movimientos = await movimientosModel
        .find({
          _id: {
            $in: hojaDeRuta.movimientos,
          },
          isDeleted: false,
        })
        .sort({ fecha: 1 });

      let arr = [];

      let result = movimientos.reduce((acc, obj) => {
        acc[obj.vehiculo] = (acc[obj.vehiculo] || 0) + obj.importe;
        return acc;
      }, {});

      let resultCajas = movimientos.reduce((acc, obj) => {
        acc[obj.vehiculo] = (acc[obj.vehiculo] || 0) + obj.cajas;
        return acc;
      }, {});

      let resultKg = movimientos.reduce((acc, obj) => {
        acc[obj.vehiculo] = (acc[obj.vehiculo] || 0) + obj.kgCong;
        return acc;
      }, {});

      movimientos.map((movimiento, i, array) => {
        const nextMov = array[i + 1];

        data = {
          fecha: moment(movimiento.fecha).format("DD/MM/YYYY"),
          cliente: movimiento.cliente.toUpperCase(),
          planta: movimiento.planta.toUpperCase(),
          vehiculo: movimiento.vehiculo,
          cajas: movimiento.cajas ? movimiento.cajas : "-",
          kgCong: movimiento.kgCong ? movimiento.kgCong + "Kg" : "-",
          importe: formatNumberToCurrency(movimiento.importe),
        };

        arr.push(data);

        if (nextMov && movimiento.vehiculo !== nextMov.vehiculo) {
          arr.push({
            cliente: {
              label: `Totales:`,
              options: {
                fontFamily: "Courier-Bold",
                fontSize: 11,
              },
            },
            importe: {
              label: formatNumberToCurrency(result[movimiento.vehiculo]),
              options: { fontFamily: "Courier-Bold", fontSize: 11 },
            },
            cajas: {
              label: `${resultCajas[movimiento.vehiculo]} Cajas`,
              options: { fontFamily: "Courier-Bold", fontSize: 11 },
            },
            kgCong: {
              label: `${resultKg[movimiento.vehiculo]} Kg`,
              options: {
                fontFamily: "Courier-Bold",
                fontSize: 11,
              },
            },
            options: { separation: true },
          });

          arr.push({
            options: {
              separation: true,
            },
            vehiculo: {
              label: `Vehículo`,
              options: {
                fontFamily: "Courier-Bold",
                fontSize: 17,
              },
            },
            cajas: {
              label: `${nextMov.vehiculo}`,
              options: { fontFamily: "Courier-Bold", fontSize: 17 },
            },
          });

          arr.push({
            cliente: {
              label: `Cliente`,
              options: {
                fontFamily: "Courier-Bold",
              },
            },
            fecha: {
              label: `Fecha`,
              options: { fontFamily: "Courier-Bold" },
            },
            planta: {
              label: `Planta`,
              options: { fontFamily: "Courier-Bold" },
            },
            vehiculo: {
              label: `Vehículo`,
              options: { fontFamily: "Courier-Bold" },
            },
            cajas: {
              label: `Cajas`,
              options: { fontFamily: "Courier-Bold" },
            },
            kgCong: {
              label: `Congelado`,
              options: { fontFamily: "Courier-Bold" },
            },
            importe: {
              label: `Importe`,
              options: { fontFamily: "Courier-Bold" },
            },
          });
        }

        if (nextMov === undefined) {
          arr.push({
            cliente: {
              label: `Totales:`,
              options: {
                fontFamily: "Courier-Bold",
                fontSize: 11,
              },
            },
            importe: {
              label: formatNumberToCurrency(result[movimiento.vehiculo]),
              options: { fontFamily: "Courier-Bold", fontSize: 11 },
            },
            cajas: {
              label: `${resultCajas[movimiento.vehiculo]} Cajas`,
              options: { fontFamily: "Courier-Bold", fontSize: 11 },
            },
            kgCong: {
              label: `${resultKg[movimiento.vehiculo]} Kg`,
              options: {
                fontFamily: "Courier-Bold",
                fontSize: 11,
              },
            },
            options: { separation: true },
          });
        }
      });
      const emision = formatDateString(new Date());
      const desde = moment(fecha).format("DD/MM/YYYY");

      /* COMIENZO DOCUMENTO PDF */
      const doc = new PDFDocumentTable({
        margin: 20,
        size: "A4",
      });

      doc.pipe(fs.createWriteStream("Exported/resumenHoja.pdf"));
      res.setHeader("Content-type", "application/pdf");
      doc.pipe(res);

      doc
        .fontSize(20)
        .font("Courier-BoldOblique")
        .text("Transporte Zoe")
        .moveDown();

      doc.rect(17, 12, 175, 30).strokeColor("grey").stroke();

      const table = {
        title: `Resumen Hoja de Ruta ${desde}`,
        subtitle: `Fecha de emisión: ${emision}`,
        headers: [
          {
            label: "Cliente",
            property: "cliente",
            valign: "center",
            align: "center",
            width: 75,
          },
          {
            label: "Fecha",
            property: "fecha",
            valign: "center",
            align: "center",
            width: 70,
          },
          {
            label: "Planta",
            property: "planta",
            valign: "center",
            align: "center",
            width: 80,
          },
          {
            label: "Vehículo",
            property: "vehiculo",
            valign: "center",
            align: "center",
            width: 90,
          },
          {
            label: "Cajas",
            property: "cajas",
            valign: "center",
            align: "center",
            width: 65,
          },
          {
            label: "Congelado",
            property: "kgCong",
            valign: "center",
            align: "center",
            width: 55,
          },

          {
            label: "Importe",
            property: "importe",
            align: "center",
            valign: "center",
            width: 120,
          },
        ],
        datas: arr,
      };

      const options = {
        rowSpacing: 10,
        colSpacing: 10,
        minRowHeight: 25,
        divider: {
          header: { disabled: false, width: 0.5, opacity: 1 },
        },
        // functions
        prepareHeader: () => doc.font("Courier-Bold").fontSize(10),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          doc.font("Courier").fontSize(10);

          indexRow % 2 === 0 && doc.addBackground(rectRow, "grey", 0.006);
        },
      };

      const callback = () => {};
      doc.table(table, options, callback);

      doc.end();
    } catch (e) {
      next(e);
    }
  },
};
