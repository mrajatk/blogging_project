export async function getMe(req, res) {
  const u = req.user;
  res.json({
    id: u._id,
    name: u.name,
    email: u.email,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    role: u.role,
  });
}

export async function updateMe(req, res) {
  const { name, bio, avatarUrl } = req.body;
  const u = await req.user
    .model("User")
    .findByIdAndUpdate(req.user._id, { name, bio, avatarUrl }, { new: true });
  res.json({
    id: u._id,
    name: u.name,
    email: u.email,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    role: u.role,
  });
}
