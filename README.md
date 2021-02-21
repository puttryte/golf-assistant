# Capstone - Colorspace Splitter

This command-line Python script splits an image into the different channels of a given color space.
This allows for each channel to be viewed individually.
For example, if RGB is given as a colorspace, separate images of the R, G, and B channels will be created.

This program uses arguments of the form `-arg=value` or `-arg`.
This program accepts the following arguments:

| Argument Name | Purpose | Values |
| :-: | :- | :-: |
| `i` | The location of the input image to split. | Any input image |
| `o` | The extension of the output image. | Any image format extension |
| `s` | The color space for which the image will be split into | `RGB`, `CMYK`, `YCbCr`, `HSV`, `L` |
| `v` | Enables visual mode, converting images back to RGB for viewability and rejoining channels for color. _Default_: disabled | none |
| `w` | Enables write mode, where images are saved to the working directory rather than directly displayed. _Default_: disabled | none |
| `h` | Enables histogram mode, where histograms of each space are created rather than images. (Currently not functional) _Default_: disabled | none |

# Usage

To split the image _image.png_ into the YCbCr colorspace, the following command could be used:

```
python color_splitter.py -i=image.png -s=YCbCr
```

This would produce three images: _image_Y.jpg_, _image_Cb.jpg_, and _image_Cr.jpg_.

The PNG format does not support the YCbCr colorspace for encoding, so in this instance if the user wanted to save a PNG image split into this space, they should enable the `w` and `v` arguments like so:

```
python color_splitter.py -i=image.png -s=YCbCr -v -w
```

If the user wanted to view the YCbCr channels of _image.png_ as a plotted histogram, the following command should be run.

```
python color_splitter.py -i=image.png -s=YCbCr -h -v
```

Including `-v` with `-h` visually graphs the histogram and displays the preview.
If `-w` is included, each histogram is written to the working directory.
