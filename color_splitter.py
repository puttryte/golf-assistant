import sys
import copy
from PIL import Image

__SUPPORTED_SPACES = {'RGB', 'CMYK', 'HSV', 'YCbCr', 'L'}

arguments = {'v': False, 'w': False, 'h': False}
for token in sys.argv:
	if token.startswith('-'):
		pair = token[1:].split('=')
		arguments[pair[0]] = True if len(pair) == 1 else pair[1]

file_in = arguments['i']
space = arguments['s']
ext_out = arguments['o'] if 'o' in arguments else file_in[file_in.rindex('.') + 1:]
visual = arguments['v']
write = arguments['w']
histogram = arguments['h']

name_in = file_in[:file_in.rindex('.')]

if space in __SUPPORTED_SPACES:
	source = Image.open(file_in).convert(mode=space)
	dim = source.size

	band_names = source.getbands()
	bands = source.split()
	num_bands = len(bands)

	if histogram:
		histograms = [band.histogram() for band in bands]

		# TODO: Finish histogram representation
		if visual:
			pass
		else:
			pass
	else:
		if visual:
			# Creates a backing image to underlay each band
			backing = None
			if space == 'YCbCr':
				backing = [Image.new('L', dim, 128) for unused in range(num_bands)]
			elif space == 'HSV':
				backing = [Image.new('L', dim), Image.new('L', dim), Image.new('L', dim, 255)]
			else:
				backing = [Image.new('L', dim) for unused in range(num_bands)]

			for i in range(num_bands):
				isolated = copy.deepcopy(backing)
				isolated[i] = bands[i]

				output = Image.merge(space, isolated).convert(mode='RGB')
				output.save(name_in + '_' + band_names[i] + '.' + ext_out) if write else output.show()
		else:
			for i in range(num_bands):
				bands[i].save(name_in + '_' + band_names[i] + '.' + ext_out) if write else bands[i].show()