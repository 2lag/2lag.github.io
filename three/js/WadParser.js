class WadParser {
  constructor( array_buffer ) {
    this.data = new DataView( array_buffer );
    this.directory = [ ];
    this.header = { };
    this.offset = 0;
  }

  readString( length ) {
    const end = this.offset + length;
    let chars = [ ];

    for ( ; this.offset < end; )
      chars.push( this.readUint8( ) );

    return String.fromCharCode( ...chars ).replace( /\0.*$/, '' );
  }

  readInt32( ) {
    let value = this.data.getInt32( this.offset, true );
    this.offset += 4;
    return value;
  }

  readUint16( ) {
    return this.data.getUint16( this.offset += 2, true );
  }

  readUint8( ) {
    return this.data.getUint8( this.offset++ );
  }

  parseHeader( ) {
    this.offset = 0;
    this.header.magic = this.readString( 4 );
    this.header.num_dirs = this.readInt32( );
    this.header.dir_offset = this.readInt32( );

    if ( this.header.magic !== "WAD3" && this.header.magic !== "WAD2" )
      throw new Error( `Invalid WAD file: ${ this.header.magic }` );
  }

  parseDirectory( ) {
    this.offset = this.header.dir_offset;

    for ( let idx = 0; idx < this.header.num_dirs; ++idx ) {
      let entry = {
        offset: this.readInt32( ),
        disk_size: this.readInt32( ),
        size: this.readInt32( ),
        type: this.readUint8( ),
        compressed: this.readUint8( ),
        padding: this.readUint16( ),
        name: this.readString( 16 )
      };

      this.directory.push( entry );
    }
  }

  extractMipTexture( entry, is_valve_fmt ) {
    this.offset = entry.offset;

    const base = this.offset;
    const name = this.readString( 16 );
    const width = this.readInt32( );
    const height = this.readInt32( );
    const offset = this.readInt32( );

    this.offset = entry.offset + offset;

    const size = width * height;
    let data = new Uint8Array( size );

    for ( let d_idx = 0; d_idx < size; ++d_idx )
      data[ d_idx ] = this.readUint8( );

    if ( !is_valve_fmt )
      return { name, width, height, data };

    const palette = extractPalette( this.data, base, width, height );
    return { name, width, height, data, palette };
  }

  getTextureFromName( name, is_valve_fmt ) {
    let dir_entry = null;
    
    for ( let d_idx = 0; d_idx < this.directory.length; ++d_idx ) {
      const dir = this.directory[ d_idx ];

      if ( dir.name.toUpperCase( ) !== name )
        continue;

      dir_entry = dir;
      break;
    }
    
    if ( !dir_entry )
      return null;

    if ( dir_entry.type !== 0x43 && is_valve_fmt ) {
      console.error( `valve non miptexture: ${ dir_entry.name }` );
      return null;
    }

    if ( dir_entry.type !== 0x44 && !is_valve_fmt ) {
      console.error( `quake non miptexture: ${ dir_entry.name }` );
      return null;
    }
    
    return this.extractMipTexture( dir_entry, is_valve_fmt );
  }
}

function extractPalette( data_view, base_offset, w, h ) {
  const header_sz = 40;
  const mip0_sz = w * h;
  const mip1_sz = ( w >> 1 ) * ( h >> 1 );
  const mip2_sz = ( w >> 2 ) * ( h >> 2 );
  const mip3_sz = ( w >> 3 ) * ( h >> 3 );

  let palette_offset = base_offset +
                       header_sz +
                       mip0_sz + mip1_sz +
                       mip2_sz + mip3_sz + 2;

  const palette = new Array( 256 );
  for ( let idx = 0; idx < palette.length; ++idx ) {
    const r = data_view.getUint8( palette_offset++ );
    const g = data_view.getUint8( palette_offset++ );
    const b = data_view.getUint8( palette_offset++ );

    palette[ idx ] = [ r, g, b ];
  }

  return palette;
}

export default WadParser;