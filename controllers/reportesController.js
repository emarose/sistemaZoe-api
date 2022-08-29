const hojasRutaModel = require("../models/hojasRutaModel");
const pagosModel = require("../models/pagosModel");
const movimientosModel = require("../models/movimientosModel");
const titularesModel = require("../models/titularesModel");
const cuentasCorrientesModel = require("../models/cuentasCorrientesModel");
const { formatDateString } = require("../util/utils");
const { formatNumberToCurrency } = require("../util/utils");
const PDFDocumentTable = require("pdfkit-table");
/* const PDFDocument = require("pdfkit"); */
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

    console.log(fechaInicio, fechaFin);

    const desde = moment(fechaInicio).format("DD/MM/YYYY");
    const hasta = moment(fechaFin).format("DD/MM/YYYY");

    try {
      const findTitulares = await titularesModel.find({
        codigo: codigo,
      });

      const findMovements = await movimientosModel
        .find({
          fecha: {
            $gte: fechaInicio,
            $lte: fechaFin,
          },
          cliente: codigo,
        })
        .sort({ _id: -1 });

      const findPagos = await pagosModel
        .find({
          fecha: {
            $gte: new Date(initDate),
            $lte: new Date(endDate),
          },
          cliente: findTitulares[0].codigo,
        })
        .sort({ _id: -1 });

      const findCC = await cuentasCorrientesModel.find({
        titular_id: findTitulares[0]._id,
      });

      const pagosMovimientos = [...findPagos, ...findMovements];

      if (pagosMovimientos.length !== 0) {
        let arr = [];

        let cajas;
        let kgCong;
        let totalImporte = 0;
        let totalCajas = 0;
        let totalKgCong = 0;
        let calcImportes = 0;
        let calcPagos = 0;

        for (let i = 0; i < pagosMovimientos.length; i++) {
          !pagosMovimientos[i].cajas
            ? (cajas = "")
            : (cajas = `${pagosMovimientos[i].cajas} Cajas \n`);

          !pagosMovimientos[i].kgCong
            ? (kgCong = "")
            : (kgCong = `${pagosMovimientos[i].kgCong} Kg. Congelado\n`);

          if (!pagosMovimientos[i].importe) {
            //PAGOS
            data = {
              cliente: pagosMovimientos[i].cliente.toUpperCase(),
              fecha: moment(pagosMovimientos[i].fecha).format("DD/MM/YYYY"),
              concepto: pagosMovimientos[i].concepto.toUpperCase(),
              importe: "­",
              monto: formatNumberToCurrency(pagosMovimientos[i].monto),

              saldo: pagosMovimientos[i].saldo_actual_currency,
            };
            calcPagos = calcPagos + pagosMovimientos[i].monto;
          } else {
            //MOVIMIENTOS
            let concepto = "";

            if (pagosMovimientos[i].vehiculo !== "-") {
              concepto = `${cajas}${kgCong}Planta: ${pagosMovimientos[
                i
              ].planta.toUpperCase()}\nVehículo: ${pagosMovimientos[
                i
              ].vehiculo.toUpperCase()}`;
            } else {
              concepto = pagosMovimientos[i].planta.toUpperCase();
            }

            data = {
              cliente: pagosMovimientos[i].cliente.toUpperCase(),
              fecha: moment(pagosMovimientos[i].fecha).format("DD/MM/YYYY"),
              concepto: concepto,
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
        }

        const ordered = [...arr].sort((a, b) => (a.fecha > b.fecha ? 1 : -1));

        ordered.push({
          monto: "Saldo período:",
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
              label: "Nombre",
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
          datas: ordered,
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
            row.monto !== "-" && row.monto !== "Saldo período:"
              ? doc.addBackground(rectRow, "grey", 0.03)
              : null;

            indexRow % 2 !== 0 && doc.addBackground(rectRow, "grey", 0.005);
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
        doc
          .moveDown(2)
          .fontSize(10)
          .font("Courier")
          .text("Saldo Actual del cliente: ", { continued: true })
          .font("Courier-Bold")
          .text(findCC[0].saldo_currency);

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
        pagosModel.find({
          fecha: {
            $gte: fechaInicio,
            $lte: fechaFin,
          },
        }),
        titularesModel.find(),
      ])
        .then((results) => {
          const [movimientos, pagos] = results;
          const pagosMovimientos = [...pagos, ...movimientos];

          pagosMovimientos.sort(function (a, b) {
            return (
              a.cliente.localeCompare(b.cliente) ||
              Number(a.fecha - Number(b.fecha))
            );
          });
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
      const findHojaRuta = await hojasRutaModel.find({
        fecha: fecha,
      });

      const findMovementsById = await movimientosModel.find({
        _id: {
          $in: findHojaRuta[0].movimientos,
        },
      });

      let arr = [];
      let totalImporte = 0;
      let totalCajas = 0;
      let totalKgCong = 0;
      let calc = 0;
      for (let i = 0; i < findMovementsById.length; i++) {
        data = {
          fecha: moment(findMovementsById[i].fecha).format("DD/MM/YYYY"),
          cliente: findMovementsById[i].cliente.toUpperCase(),
          planta: findMovementsById[i].planta.toUpperCase(),
          vehiculo: findMovementsById[i].vehiculo,
          cajas:
            findMovementsById[i].cajas !== 0 ? findMovementsById[i].cajas : "-",
          kgCong:
            findMovementsById[i].kgCong !== 0
              ? findMovementsById[i].kgCong + "Kg"
              : "-",
          importe: formatNumberToCurrency(findMovementsById[i].importe),
        };

        arr.push(data);
      }

      /*   const ordered = [...arr].sort((a, b) => (a.fecha > b.fecha ? 1 : -1));  */

      arr.push({
        importe: {
          label: findHojaRuta[0].importeTotal_currency,
          options: { fontFamily: "Courier-Bold" },
        },
        cajas: {
          label: ` ${findHojaRuta[0].cajasTotal}`,
          options: { fontFamily: "Courier-Bold" },
        },
        kgCong: {
          label: `${findHojaRuta[0].kgTotal}`,
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
        .text(`${findHojaRuta[0].cajasTotal} Cajas.`);

      doc
        .moveDown()
        .fontSize(10)
        .font("Courier")
        .text("Kg de congelado: ", { continued: true })
        .font("Courier-Bold")
        .text(`${findHojaRuta[0].kgTotal} Kg.`);
      doc
        .moveDown()
        .fontSize(10)
        .font("Courier")
        .text("Importe del período: ", { continued: true })
        .font("Courier-Bold")
        .text(findHojaRuta[0].importeTotal_currency);

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
