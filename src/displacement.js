export default function Displace (geometry, displacementMap, displacementScale, displacementBias) {
    const canvas = document.createElement('canvas');
    canvas.width = displacementMap.image.width;
    canvas.height = displacementMap.image.height;
    const context = canvas.getContext('2d');
    context.drawImage(displacementMap.image, 0, 0, displacementMap.image.width, displacementMap.image.height);

    const width = geometry.parameters.widthSegments + 1;
    const height = geometry.parameters.heightSegments + 1;
    const widthStep = canvas.width / width;
    const heightStep = canvas.height / height;

    const positions = geometry.attributes.position.array;
    const numVertices = positions.length /3;

    for(let i = 0; i < height; i++){
        for(let j = 0; j < width; j++){
            const imgData = context.getImageData
            (
                Math.round(j * widthStep),
                Math.round(i * heightStep),
                1,
                1
            ).data;
            let displacement = (imgData[0] / 255.0) * displacementScale + displacementBias;
            const index = (i * width + j) * 3;
            if(index / 3 < numVertices){
                positions[index + 2] = displacement;
            }
        }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
}