
const protect= (img:HTMLImageElement) => {
  const ratio = img.width / img.height;
  
  const maxSquare = 5000000;  // ios max canvas square
  const maxSize = 4096;  // ie max canvas dimensions
  
  let maxW = Math.floor(Math.sqrt(maxSquare * ratio));
  let maxH = Math.floor(maxSquare / Math.sqrt(maxSquare * ratio));
  if (maxW > maxSize) {
    maxW = maxSize;
    maxH = Math.round(maxW / ratio);
  }
  if (maxH > maxSize) {
    maxH = maxSize;
    maxW = Math.round(ratio * maxH);
  }
  if (img.width > maxW) {
    const canvas = document.createElement('canvas');
    canvas.width = maxW;
    canvas.height = maxH;
    canvas.getContext('2d')!.drawImage(img, 0, 0, maxW, maxH);
    img.src = 'about:blank';
    img.width = 1;
    img.height = 1;
    img = canvas;
  }
  
  return img;
}

export const resize = (img:HTMLImageElement, w:number,  h:number) => {
  //var df = $.Deferred();

  setTimeout(function(){
    img = protect(img);
    console.log(img.width, img.height);

    var steps = Math.ceil(Math.log(img.width / w) / Math.LN2);
    var sW = w * Math.pow(2, steps - 1);
    var sH = h * Math.pow(2, steps - 1);
    var x = 2;

    function run() {
      if ( ! (steps--)) {
        //df.resolve(img);
        return;
      }

      setTimeout(function() {
        console.log(sW, sH);
        const canvas = document.createElement('canvas')!;
        canvas.width = sW;
        canvas.height = sH;
        canvas.getContext('2d')!.drawImage(img, 0, 0, sW, sH);
        img.src = 'about:blank';
        img.width = 1;
        img.height = 1;
        img = canvas;

        sW = Math.round(sW / x);
        sH = Math.round(sH / x);
        run();
      }, 0);
    }
    run();

  }, 0);

  //return df.promise();
}


function imageLoader(src) {
  var df = $.Deferred();
  var img = new Image();
  img.onload = function() {
    df.resolve(img);
  };
  img.onerror = function() {
    df.reject(img);
  };
  img.src = src;
  return df.promise();
}


var resizeQueue = taskQueue(1);

function resizeFile(file, width) {
 // var df = $.Deferred();
  resizeQueue(function(release) {
    //df.always(release);
    
    var op = imageLoader(URL.createObjectURL(file));
    op.done(function(img) {
      var height = Math.round(width * img.height / img.width);
      resize(img, width, height).done(df.resolve);
    });
    op.fail(df.reject);
    op.always(function(img) {
      URL.revokeObjectURL(img.src);
    });
  });
  return df.promise();
}


// $('#file').on('change', function() {
//   $.each($('#file').prop('files'), function(i, file) {
//     resizeFile(file, width).done(function(canvas) {
//       $('body').append(
//         $("<p/>").append(canvas)
//       );
//     });
//   });
// });