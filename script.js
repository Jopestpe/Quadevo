const entrada_largura = document.getElementById("entrada_largura");
const entrada_altura = document.getElementById("entrada_altura");
const entrada_regioes = document.getElementById("entrada_regioes");
const seletor_cor = document.getElementById("seletor_cor");
const zoom_span = document.getElementById("zoom_span");
const botao_zoom = document.getElementById("botao_zoom");
const svg = d3.select("#voronoi");
let regioes = [];
let voronoi;

function reajustar_zoom() {
  let menor = entrada_largura.value > entrada_altura.value  ? entrada_altura.value : entrada_largura.value;
  definir_zoom((menor / 4), true);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "z") {
    botao_zoom.click();
  }
});

botao_zoom.addEventListener("click", () => {
  reajustar_zoom();
});

document.getElementById("voronoi_area").addEventListener("wheel", (event) => {
  event.preventDefault();
  let zoomAtual = parseFloat(zoom_span.value);
  const delta = event.deltaY > 0 ? -1 : 1;
  let novoZoom = Math.min(1000, Math.max(1, zoomAtual + delta));
  definir_zoom(novoZoom, true);
});

zoom_span.addEventListener("input", (evento) => {
  definir_zoom(zoom_span.value, false);
});

function definir_zoom(novo_zoom, definir_input = true) {
  svg.attr("transform", `scale(${novo_zoom / 100})`);
  if (definir_input) {
    zoom_span.value = parseFloat(novo_zoom).toFixed(0);
  }
}

function gerar_voronoi() {
    svg.attr("width", entrada_largura.value).attr("height", entrada_altura.value);
    svg.selectAll("*").remove();

    regioes = [];
    for (let i = 0; i < entrada_regioes.value; i++) {
        regioes.push([
            Math.random() * entrada_largura.value,
            Math.random() * entrada_altura.value
        ]);
    }

    const delaunay = d3.Delaunay.from(regioes);
    voronoi = delaunay.voronoi([0, 0, entrada_largura.value, entrada_altura.value]);

    svg.selectAll(".voronoi_regiao")
        .data(regioes)
        .enter()
        .append("path")
        .attr("class", "voronoi_regiao")
        .attr("d", (d, i) => voronoi.renderCell(i))
        .attr("fill", () => gerar_cor())
        .attr("opacity", 0)
        .on("click", clicou_regiao)
        .transition()
        .duration(100)
        .attr("opacity", 1)
}


function clicou_regiao(evento, celula) {
    d3.select(this)
        .transition()
        .duration(300)
        .attr("fill", seletor_cor.value);
    d3.select(this)
        .classed("animar", true)
        .transition()
        .delay(300)
        .duration(100)
        .on("end", function() {
            d3.select(this).classed("animar", false);
        });
}

function gerar_cor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

function novas_cores() {
    const cells = svg.selectAll(".voronoi_regiao");
    
    cells.each(function(d, i) {
        d3.select(this)
            .transition()
            .duration(100)
            .attr("fill", gerar_cor())
            .transition()
            .duration(100)
            .attr("fill", gerar_cor());
    });
}

function baixar_svg() {
    const svgNode = document.getElementById("voronoi");
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgNode);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "voronoi.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}



entrada_largura.addEventListener("input", gerar_voronoi);
entrada_altura.addEventListener("input", gerar_voronoi);
entrada_regioes.addEventListener("input", gerar_voronoi);

document.getElementById('selecionar_cor').addEventListener('click', () => {
    document.getElementById('seletor_cor').click();
});

seletor_cor.addEventListener('change', function() {
    document.getElementById('pincel_bico').setAttribute('fill', seletor_cor.value);
});

document.getElementById("baixar_svg").addEventListener("click", function() {
    baixar_svg();
});

document.getElementById('novas_cores').addEventListener('click', function() {
  novas_cores();
});

document.getElementById('gerar_voronoi').addEventListener('click', function() {
  gerar_voronoi();
});


gerar_voronoi();
