const hojasRutaModel = require("../models/hojasRutaModel");
const movimientosModel = require("../models/movimientosModel");
const cuentasCorrientesModel = require("../models/cuentasCorrientesModel");

const { formatDateString } = require("../util/utils");
const { formatNumberToCurrency } = require("../util/utils");
const PDFDocumentTable = require("pdfkit-table");
const moment = require("moment");
const fs = require("fs");

module.exports = {
  entrefechas: async function (req, res, next) {
    const { initDate, endDate, codigo } = req.body.data;
    const emision = formatDateString(new Date());

    const fechaInicio = new Date(initDate);
    fechaInicio.setHours(-3);
    fechaInicio.setMinutes(0);
    fechaInicio.setMilliseconds(0);
    fechaInicio.setSeconds(0);

    const fechaFin = new Date(endDate);
    fechaFin.setHours(24);
    fechaFin.setMinutes(0);
    fechaFin.setMilliseconds(0);
    fechaFin.setSeconds(0);

    const desde = moment(fechaInicio).format("DD/MM/YYYY");
    const hasta = moment(fechaFin).format("DD/MM/YYYY");

    try {
      const cuentaCorriente = await cuentasCorrientesModel.findOne({
        titular: codigo,
      });

      const dataMovimientos = await movimientosModel
        .find({
          fecha: {
            $gte: fechaInicio,
            $lte: fechaFin,
          },
          cliente: codigo,
        })
        .sort({ fecha: 1 });

      const movimientos = JSON.parse(JSON.stringify(dataMovimientos));

      let sumaPagos = 0;
      let sumaMovimientos = 0;
      let sumaCongelado = 0;
      let sumaFresco = 0;

      movimientos.map((movimiento) => {
        switch (movimiento.tipo) {
          case "ENTRADA":
            sumaPagos += movimiento.importe;
            break;
          case "SALIDA":
            sumaCongelado +=
              cuentaCorriente.precioCongelado * movimiento.kgCong;
            sumaFresco += cuentaCorriente.precioFresco * movimiento.cajas;
            if (movimiento.precioCongelado !== 0) {
              sumaMovimientos = sumaFresco + sumaCongelado;
            } else {
              sumaMovimientos += movimiento.importe;
            }
            break;
        }
        Object.assign(movimiento, { saldo: sumaMovimientos - sumaPagos });
      });

      if (movimientos.length !== 0) {
        let arr = [];
        let data = {};

        let cajas;
        let kgCong;
        let totalImporte = 0;
        let totalCajas = 0;
        let totalKgCong = 0;

        movimientos.map((movimiento, i) => {
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

          totalCajas = totalCajas + movimiento.cajas;
          totalKgCong = totalKgCong + movimiento.kgCong;

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

        /* COMIENZO DOCUMENTO PDF */
        const doc = new PDFDocumentTable({
          margin: 20,
          size: "A4",
        });

        doc.pipe(fs.createWriteStream("Exported/ListadoEntreFechas.pdf"));
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
          // {Number} default: undefined // A4 595.28 x 841.89 (portrait) (about width sizes)
          x: 0, // {Number} default: undefined | doc.x
          rowSpacing: 10,
          colSpacing: 10,
          minRowHeight: 25,

          // functions
          prepareHeader: () => doc.font("Courier-Bold").fontSize(10), // {Function}
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
        /*  doc
          .moveDown(2)
          .fontSize(10)
          .font("Courier")
          .text("Saldo Actual del cliente: ", { continued: true })
          .font("Courier-Bold")
          .text(saldo);
 */
        doc.end();
      } else {
        res.status(205).send("sin datos");
      }
    } catch (e) {
      next(e);
    }
  },
  entrefechasTodos: async function (req, res, next) {
    const { initDate, endDate } = req.body.data;

    const emision = formatDateString(new Date());

    const fechaInicio = new Date(initDate);
    fechaInicio.setHours(4);
    fechaInicio.setMinutes(0);
    fechaInicio.setMilliseconds(0);
    fechaInicio.setSeconds(0);

    const fechaFin = new Date(endDate);
    fechaFin.setHours(8);
    fechaFin.setMinutes(0);
    fechaFin.setMilliseconds(0);
    fechaFin.setSeconds(0);

    const desde = moment(fechaInicio).format("DD/MM/YYYY");
    const hasta = moment(fechaFin).format("DD/MM/YYYY");

    try {
      Promise.all([
        movimientosModel.find({
          fecha: {
            $gte: fechaInicio,
            $lte: fechaFin,
          },
        }),

        cuentasCorrientesModel.find(),
      ])
        .then((results) => {
          /* 
          for (let i = 0; i < clientes.length; i++) { */
          let arr = [];
          let cajas;
          let kgCong;
          let totalImporte = 0;
          let totalCajas = 0;
          let totalKgCong = 0;
          let calcImportes = 0;
          let calcPagos = 0;

          const doc = new PDFDocumentTable({
            margin: 20,
            size: "A4",
          });

          for (let i = 0; i < pagosMovimientos.length; i++) {
            if (!pagosMovimientos[i].cajas) {
              cajas = "";
            } else {
              cajas = `${pagosMovimientos[i].cajas} Cajas \n`;
            }

            if (!pagosMovimientos[i].kgCong) {
              kgCong = "";
            } else {
              kgCong = `${pagosMovimientos[i].kgCong} Kg. Congelado\n`;
            }

            if (!pagosMovimientos[i].importe) {
              //PAGOS
              data = {
                cliente: pagosMovimientos[i].cliente.toUpperCase(),
                fecha: moment(pagosMovimientos[i].fecha).format("DD/MM/YYYY"),
                concepto: pagosMovimientos[i].concepto.toUpperCase(),
                importe: "­", //DEBE
                monto: formatNumberToCurrency(pagosMovimientos[i].monto), //HABER
                saldo: pagosMovimientos[i].saldo_actual_currency,
              };

              calcPagos = calcPagos + pagosMovimientos[i].monto;
            } else {
              //MOVIMIENTOS
              data = {
                cliente: pagosMovimientos[i].cliente.toUpperCase(),
                fecha: moment(pagosMovimientos[i].fecha).format("DD/MM/YYYY"),
                concepto: `${cajas}${kgCong}Planta: ${
                  pagosMovimientos[i].planta.toUpperCase() ||
                  movimientos[i].concepto
                }\nVehículo: ${pagosMovimientos[i].vehiculo.toUpperCase()}`,
                totalKg: pagosMovimientos[i].saldo_anterior_currency,
                importe: formatNumberToCurrency(pagosMovimientos[i].importe), //DEBE
                monto: "-", //HABER
                saldo: pagosMovimientos[i].saldo_actual_currency,
              };

              calcImportes = calcImportes + pagosMovimientos[i].importe;
              totalCajas = totalCajas + pagosMovimientos[i].cajas;
              totalKgCong = totalKgCong + pagosMovimientos[i].kgCong;
            }
            totalImporte = formatNumberToCurrency(calcImportes - calcPagos);

            arr.push(data);

            let len = i + 1;

            if (
              pagosMovimientos[i].cliente !== pagosMovimientos[len]?.cliente
            ) {
              arr.push({
                importe: "Importe total",
                monto: "del Período:",
                saldo: {
                  label: totalImporte,
                  options: {
                    fontFamily: "Courier-Bold",
                  },
                },
              });
              arr.push({ cliente: "fin" });
            }
          }

          doc.pipe(fs.createWriteStream("Exported/ListadoEntreFechas.pdf"));
          res.setHeader("Content-type", "application/pdf");
          doc.pipe(res);

          doc
            .fontSize(20)
            .font("Courier-BoldOblique")
            .text("Transporte Zoe")
            .moveDown();
          doc.rect(17, 12, 175, 30).strokeColor("grey").stroke();

          doc
            .fontSize(15)
            .font("Courier-BoldOblique")
            .text(`Resumen entre fechas: ${desde} - ${hasta}`)
            .moveDown();

          doc
            .fontSize(11)
            .font("Courier-BoldOblique")
            .text(`Fecha de emisión: ${emision}`)
            .moveDown();

          const table = {
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
                property: "importe",
                valign: "center",
                align: "center",
                width: 80,
              },
              {
                label: "Haber",
                property: "monto",
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
            // functions
            prepareHeader: () => doc.font("Courier-Bold").fontSize(11),
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
              doc.font("Courier").fontSize(10),
                row.monto !== "-" && doc.addBackground(rectRow, "grey", 0.02);
              row.cliente === "fin" && doc.addBackground(rectRow, "white", 1);
              indexRow % 2 !== 0 && doc.addBackground(rectRow, "grey", 0.005);
            },
          };

          const callback = () => {};
          doc.table(table, options, callback);
          /* 
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
            .text(totalImporte); */
          doc.end();

          /*    } */
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (e) {
      next(e);
    }
  },
  resumenHoja: async function (req, res, next) {
    const initDate = req.body.data;

    const emision = formatDateString(new Date());

    const fecha = new Date(initDate);
    fecha.setHours(4);
    fecha.setMinutes(0);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);

    const desde = moment(fecha).format("DD/MM/YYYY");

    try {
      const hojaDeRuta = await hojasRutaModel.findOne({
        fecha: fecha,
      });

      const movimientos = await movimientosModel
        .find({
          _id: {
            $in: hojaDeRuta.movimientos,
          },
        })
        .sort({ fecha: 1 });

      let arr = [];
      let totalImporte = 0;
      let totalCajas = 0;
      let totalKgCong = 0;
      let calc = 0;

      movimientos.map((movimiento) => {
        data = {
          fecha: moment(movimiento.fecha).format("DD/MM/YYYY"),
          cliente: movimiento.cliente.toUpperCase(),
          planta: movimiento.planta.toUpperCase(),
          vehiculo: movimiento.vehiculo,
          cajas: movimiento.cajas !== 0 ? movimiento.cajas : "-",
          kgCong: movimiento.kgCong !== 0 ? movimiento.kgCong + "Kg" : "-",
          importe: formatNumberToCurrency(movimiento.importe),
        };
        arr.push(data);
      });
      /* for (let i = 0; i < findMovementsById.length; i++) {
        data = {
          fecha: moment(movimientos.fecha).format("DD/MM/YYYY"),
          cliente: movimientos.cliente.toUpperCase(),
          planta: movimientos.planta.toUpperCase(),
          vehiculo: movimientos.vehiculo,
          cajas: movimientos.cajas !== 0 ? findMovementsByI.cajas : "-",
          kgCong: movimientos.kgCong !== 0 ? movimientos.kgCong + "Kg" : "-",
          importe: formatNumberToCurrency(movimientos.importe),
        };

        arr.push(data);
      } */

      /*   const ordered = [...arr].sort((a, b) => (a.fecha > b.fecha ? 1 : -1));  */

      arr.push({
        importe: {
          label: hojaDeRuta.importeTotal_currency,
          options: { fontFamily: "Courier-Bold" },
        },
        cajas: {
          label: `${hojaDeRuta.cajasTotal} Cajas`,
          options: { fontFamily: "Courier-Bold" },
        },
        kgCong: {
          label: `${hojaDeRuta.kgTotal} Kg.`,
          options: { fontFamily: "Courier-Bold" },
        },
      });

      /* COMIENZO DOCUMENTO PDF */
      const doc = new PDFDocumentTable({
        margin: 20,
        size: "A4",
      });

      doc.pipe(fs.createWriteStream("Exported/ListadoEntreFechas.pdf"));
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
            label: "Planta",
            property: "planta",
            valign: "center",
            align: "center",
          },
          {
            label: "Vehículo",
            property: "vehiculo",
            valign: "center",
            align: "center",
          },
          {
            label: "Cajas",
            property: "cajas",
            valign: "center",
            align: "center",
          },
          {
            label: "Congelado",
            property: "kgCong",
            valign: "center",
            align: "center",
          },

          {
            label: "Importe",
            property: "importe",
            valign: "center",
            align: "center",
          },
        ],
        datas: arr,
      };

      const options = {
        rowSpacing: 10,
        colSpacing: 10,
        minRowHeight: 25,
        // functions
        prepareHeader: () => doc.font("Courier-Bold").fontSize(10),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          doc.font("Courier").fontSize(10),
            indexRow % 2 !== 0 && doc.addBackground(rectRow, "grey", 0.005);
        },
      };

      const callback = () => {};
      doc.table(table, options, callback);

      /*  doc.moveDown(2).fontSize(11).font("Courier-Bold").text("Resumen de hoja");

      doc
        .moveDown()
        .fontSize(10)
        .font("Courier")
        .text("Cantidad de cajas: ", { continued: true })
        .font("Courier-Bold")
        .text(`${hojaDeRuta.cajasTotal} Cajas.`);

      doc
        .moveDown()
        .fontSize(10)
        .font("Courier")
        .text("Kg de congelado: ", { continued: true })
        .font("Courier-Bold")
        .text(`${hojaDeRuta.kgTotal} Kg.`);
      doc
        .moveDown()
        .fontSize(10)
        .font("Courier")
        .text("Importe total: ", { continued: true })
        .font("Courier-Bold")
        .text(hojaDeRuta.importeTotal_currency);
 */
      doc.end();
    } catch (e) {
      next(e);
    }
  },
  resumenHojasEntreFechas: async function (req, res, next) {
    const { initDate, endDate } = req.body.data;

    const emision = formatDateString(new Date());

    const fechaInicio = new Date(initDate);
    fechaInicio.setHours(4);
    fechaInicio.setMinutes(0);
    fechaInicio.setMilliseconds(0);
    fechaInicio.setSeconds(0);

    const fechaFin = new Date(endDate);
    fechaFin.setHours(8);
    fechaFin.setMinutes(0);
    fechaFin.setMilliseconds(0);
    fechaFin.setSeconds(0);

    const desde = moment(fechaInicio).format("DD/MM/YYYY");
    const hasta = moment(fechaFin).format("DD/MM/YYYY");

    try {
      Promise.all([
        movimientosModel.find({
          fecha: {
            $gte: fechaInicio,
            $lte: fechaFin,
          },
        }),
        hojasRutaModel.find({
          fecha: {
            $gte: fechaInicio,
            $lte: fechaFin,
          },
        }),
      ])
        .then((results) => {
          const [movimientos, hojas] = results;
          console.log(hojas);

          let arr = [];
          let cajas;
          let kgCong;
          let totalImporte = 0;
          let totalCajas = 0;
          let totalKgCong = 0;
          let calcImportes = 0;
          let calcPagos = 0;

          const doc = new PDFDocumentTable({
            margin: 20,
            size: "A4",
          });

          /* for (let i = 0; i < hojas.length; i++) {
            if (!pagosMovimientos[i].cajas) {
              cajas = "";
            } else {
              cajas = `${pagosMovimientos[i].cajas} Cajas \n`;
            }

            if (!pagosMovimientos[i].kgCong) {
              kgCong = "";
            } else {
              kgCong = `${pagosMovimientos[i].kgCong} Kg. Congelado\n`;
            }

            if (!pagosMovimientos[i].importe) {
              //PAGOS
              data = {
                cliente: pagosMovimientos[i].cliente.toUpperCase(),
                fecha: moment(pagosMovimientos[i].fecha).format("DD/MM/YYYY"),
                concepto: pagosMovimientos[i].concepto.toUpperCase(),
                importe: "­", //DEBE
                monto: formatNumberToCurrency(pagosMovimientos[i].monto), //HABER
                saldo: pagosMovimientos[i].saldo_actual_currency,
              };

              calcPagos = calcPagos + pagosMovimientos[i].monto;
            } else {
              //MOVIMIENTOS
              data = {
                cliente: pagosMovimientos[i].cliente.toUpperCase(),
                fecha: moment(pagosMovimientos[i].fecha).format("DD/MM/YYYY"),
                concepto: `${cajas}${kgCong}Planta: ${pagosMovimientos[
                  i
                ].planta.toUpperCase()}\nVehículo: ${pagosMovimientos[
                  i
                ].vehiculo.toUpperCase()}`,
                totalKg: pagosMovimientos[i].saldo_anterior_currency,
                importe: formatNumberToCurrency(pagosMovimientos[i].importe), //DEBE
                monto: "-", //HABER
                saldo: pagosMovimientos[i].saldo_actual_currency,
              };

              calcImportes = calcImportes + pagosMovimientos[i].importe;
              totalCajas = totalCajas + pagosMovimientos[i].cajas;
              totalKgCong = totalKgCong + pagosMovimientos[i].kgCong;
            }
            totalImporte = formatNumberToCurrency(calcImportes - calcPagos);

            arr.push(data);

            let len = i + 1;

            if (
              pagosMovimientos[i].cliente !== pagosMovimientos[len]?.cliente
            ) {
              arr.push({
                importe: "Importe total",
                monto: "del Período:",
                saldo: {
                  label: totalImporte,
                  options: {
                    fontFamily: "Courier-Bold",
                  },
                },
              });
              arr.push({ cliente: "fin" });
            }
          }

          doc.pipe(fs.createWriteStream("Exported/ListadoEntreFechas.pdf"));
          res.setHeader("Content-type", "application/pdf");
          doc.pipe(res);

          doc
            .fontSize(20)
            .font("Courier-BoldOblique")
            .text("Transporte Zoe")
            .moveDown();
          doc.rect(17, 12, 175, 30).strokeColor("grey").stroke();

          doc
            .fontSize(15)
            .font("Courier-BoldOblique")
            .text(`Resumen entre fechas: ${desde} - ${hasta}`)
            .moveDown();

          doc
            .fontSize(11)
            .font("Courier-BoldOblique")
            .text(`Fecha de emisión: ${emision}`)
            .moveDown();

          const table = {
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
                property: "importe",
                valign: "center",
                align: "center",
                width: 80,
              },
              {
                label: "Haber",
                property: "monto",
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
            // functions
            prepareHeader: () => doc.font("Courier-Bold").fontSize(11),
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
              doc.font("Courier").fontSize(10),
                row.monto !== "-" && doc.addBackground(rectRow, "grey", 0.02);
              row.cliente === "fin" && doc.addBackground(rectRow, "white", 1);
              indexRow % 2 !== 0 && doc.addBackground(rectRow, "grey", 0.005);
            },
          };

          const callback = () => {};
          doc.table(table, options, callback); */

          /*       doc.end(); */
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (e) {
      next(e);
    }
  },
};
