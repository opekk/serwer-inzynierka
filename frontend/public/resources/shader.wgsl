/**
 * A structure with fields labeled with vertex attribute locations can be used
 * as input to the entry point of a shader.
 */
struct vertex_input 
{
  @location(0) position: vec3f,
  @location(1) normal: vec3f,
  @location(2) color: vec3f,
	@location(3) uv: vec2f,
	@location(4) tangent: vec3f,
	@location(5) bitangent: vec3f,
};

/**
 * A structure with fields labeled with builtins and locations can also be used
 * as *output* of the vertex shader, which is also the input of the fragment
 * shader.
 */
struct vertex_output 
{
  @builtin(position) position: vec4f,
  @location(0) color: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
  @location(3) view_direction: vec3f,
  @location(4) tangent: vec3f,
  @location(5) bitangent: vec3f,
};

/**
 * A structure holding the value of our uniforms
 */
struct my_uniforms
{
	projection_matrix: mat4x4f,
	view_matrix: mat4x4f,
	model_matrix: mat4x4f,
  color: vec4f,
  camera_world_position: vec3f,
  time: f32,
};

/**
 * A structure holding the lighting settings
 */
struct lighting_uniforms
{
	directions: array<vec4f, 2>,
	colors: array<vec4f, 2>,
  hardness: f32,
  kd: f32,
  ks: f32,
};

@group(0) @binding(0) var<uniform> u_my_uniforms: my_uniforms;
@group(0) @binding(1) var base_color_texture: texture_2d<f32>;
@group(0) @binding(2) var noraml_texture: texture_2d<f32>;
@group(0) @binding(3) var texture_sampler: sampler;
@group(0) @binding(4) var<uniform> u_lighning: lighting_uniforms;

@vertex
fn vs_main(in: vertex_input) -> vertex_output 
{
	var out: vertex_output;
  let world_position = u_my_uniforms.model_matrix * vec4f(in.position, 1.0); 
	out.position = u_my_uniforms.projection_matrix * u_my_uniforms.view_matrix * world_position;
  out.tangent = (u_my_uniforms.model_matrix * vec4f(in.tangent, 0.0)).xyz;
  out.bitangent = (u_my_uniforms.model_matrix * vec4f(in.bitangent, 0.0)).xyz;
  out.normal = (u_my_uniforms.model_matrix * vec4f(in.normal, 0.0)).xyz;
  out.color = in.color;
	out.uv = in.uv;
  out.view_direction = u_my_uniforms.camera_world_position - world_position.xyz;
  return out;
}

@fragment
fn fs_main(in: vertex_output) -> @location(0) vec4f {
  // Compute 
  // Sample normal
  let normal_map_strength = 1.0; // later maybe uniform
  let encoded_normal = textureSample(noraml_texture, texture_sampler, in.uv).rgb;
  let local_normal = encoded_normal * 2.0 - 1.0;
  // The TBN matrix converts directions from the local space to the world space
  let local_to_world = mat3x3f(
    normalize(in.tangent),
    normalize(in.bitangent),
    normalize(in.normal),
  );
  let world_normal = local_to_world * local_normal;
  let N = mix(in.normal, world_normal, normal_map_strength);
	var V = normalize(in.view_direction);

  // Sample texture
  let base_color = textureSample(base_color_texture, texture_sampler, in.uv).rgb;
  let kd = u_lighning.kd; // strength of the diffuse effect
  let ks = u_lighning.ks; // strength of the specular effect
  let hardness = u_lighning.hardness; // shininess of the surface

  var color = vec3f(0.0);
	for (var i: i32 = 0; i < 2; i++)
	{
		let light_color = u_lighning.colors[i].xyz;
    let L = normalize(u_lighning.directions[i].xyz);
    let R = reflect(-L, N);

    let diffuse = max(0.0, dot(L, N)) * light_color;

    let RoV = max(0.0, dot(R, V));
    let specular = pow(RoV, hardness);

    color += base_color * (kd * diffuse) + (ks * specular);
	}
	
  // Gamma-correction
  let corrected_color = pow(color, vec3f(2.2));
  return vec4f(corrected_color, u_my_uniforms.color.a);
}